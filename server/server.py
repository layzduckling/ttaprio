from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

import asyncio
import json
import logging
import websockets

from openai import OpenAI

from dotenv import load_dotenv
import os

load_dotenv()
URI = os.environ.get("URI") 
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

logging.getLogger().setLevel("INFO")

gpt_client = OpenAI(
    api_key=OPENAI_API_KEY
)

# app instance
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*', engineio_logger=True)
CORS(app)

async def fetch_ai_response(prompt):
    req = {
        "prompt": prompt["prompt"],
        "max_new_tokens": 250,
        "auto_max_new_tokens": True,
        "max_tokens_second": 0,
                
        "preset": "None",
        "do_sample": True,
        "temperature": prompt["temperature"],
        "top_p": prompt["top_p"],
        "typical_p": 1,
        "epsilon_cutoff": 0,
        "eta_cutoff": 0,
        "tfs": 1,
        "top_a": 0,
        "repetition_penalty": 1.18,
        "repetition_penalty_range": 0,
        "top_k": 40,
        "min_length": 0,
        "no_repeat_ngram_size": 0,
        "num_beams": 1,
        "penalty_alpha": 0,
        "length_penalty": 1,
        "early_stopping": False,
        "mirostat_mode": 0,
        "mirostat_tau": 5,
        "mirostat_eta": 0.1,
        "grammar_string": "",
        "guidance_scale": 1,
        "negative_prompt": "",

        "seed": -1,
        "add_bos_token": True,
        "truncation_length": 2048,
        "ban_eos_token": False,
        "custom_token_bans": "",
        "skip_special_tokens": True,
        "stopping_strings": []
    }

    logging.info(req)

    async with websockets.connect(URI, ping_interval=None) as websocket:
        await websocket.send(json.dumps(req))

        response = ""

        while True:
            incoming_data = json.loads(await websocket.recv())

            match incoming_data["event"]:
                case "text_stream":
                    response += incoming_data["text"]
                case "stream_end":
                    logging.info(response)
                    return response

@socketio.on("tutorReq")
def handle_improve(data):  # Contains the prompt, the temperature value and the top_p value.
    logging.info("Connected")
    try:
        response = asyncio.run(fetch_ai_response(data))
    except websockets.exceptions.InvalidURI: 
        logging.info("Model connection error. Falling back...")

        with open("koreanlang.txt", "r", encoding="utf-8") as file:
            korean_lang_context = file.read()

        raw_res = gpt_client.chat.completions.create(
            messages=[
            {
                "role": "system",
                "content": f"너는 이제부터 수행평가 형식과 기준에 맞추어 알맞은 수행평가 과제물을 작성해야 해. 반드시 이 작품들을 참고해서 답안을 작성해줘. {korean_lang_context}"
            },
            {
                "role": "user",
                "content": data["prompt"],
            }],
            model="gpt-4",
        )

        response = raw_res.choices[0].message.content
    
    emit("tutorRes", response)


@socketio.on("gptTutorReq")
def gpt_handle_improve(data):
    logging.info("Connected")
    raw_res = gpt_client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": data,
        }],
        model="gpt-4",
    )

    response = raw_res.choices[0].message.content

    emit("gptTutorRes", response)

@socketio.on("evaluationReq")
def handle_eval(data):
    logging.info("Connected")
    text = data

    request = f"""
    지금부터 글을 평가기준에 대해 평가해주면 돼. 답은 A,B,C,D,E 중 하나로 답해줘. 아래 평가기준이랑 본문을 보내줄꺼야.

평가기준 : {rubric} 
본문 : {text}

글을 평가하고 답을 A,B,C,D,E 중 하나를 선택해서 한 글자로 답해줘. 그리고 아래에 이유를 써줘. 
참고) 매우 잘했으면 A, 잘했지만 길이가 짧거나 본문에서 충족하지 않는 부분이 있으면 B, 전체적으로 잘하지 못하면 C, 글의 질이 나쁘고 길이나 매우 짧거나 성의가 보이지 않으면 D, 공백이 오면 E를 줘.
    """

    response = gpt_client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": request,
        }],
        model="gpt-4",
    )

    response_processed = response.choices[0].message.content.split("\n")
    grade, reason = [i for i in response_processed if i != '']  # GPT might add more than one enter between the grade and the reason
    grade = ''.join([i for i in grade if i.isalpha() and i.isascii()])  # Filter grade to only display the grade value

    emit("evaluationRes", {"grade": grade, "reason": reason})


instruction = ""
rubric = ""

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8080, debug=True)
