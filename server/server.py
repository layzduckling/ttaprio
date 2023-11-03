from flask import Flask, request
from flask_socketio import SocketIO, send
from flask_cors import CORS

import asyncio
import json
import logging
import websockets

from dotenv import load_dotenv
import os

load_dotenv()
URI = os.environ.get("URI") 

logging.getLogger().setLevel("INFO")

# app instance
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')
CORS(app)

async def fetch_ai_response():
    global instruction, requested_text

    req = {
        "prompt": f"{instruction}\n\"{requested_text}\"를 개선해줘.",
        "max_new_tokens": 250,
        "auto_max_new_tokens": True,
        "max_tokens_second": 0,
                
        "preset": "None",
        "do_sample": True,
        "temperature": 0.7,
        "top_p": 0.1,
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

    async with websockets.connect(URI, ping_interval=None) as websocket:
        await websocket.send(json.dumps(req))

        while True:
            incoming_data = json.loads(await websocket.recv())

            match incoming_data["event"]:
                case "text_stream":
                    yield incoming_data["text"]
                    print(incoming_data["text"], end="") # TODO: Change logging terminator
                case "stream_end":
                    return 

@app.route("/api/config-test", methods=["POST"])
def config_test():
    if request.method == "POST":
        global instruction

        configurations = request.get_json()
        instruction = f"나는 {configurations['publisher']} 교과서를 쓰는 {configurations['schooltype']} {configurations['semester']} 학생이야. 곧 {configurations['subject']} {configurations['title']} 수행평가를 봐야 하는데, {configurations['rubric']}에 따라서 채점 돼. 수행평가 형식은 {configurations['format']}이야."

        logging.info(instruction)

        return "Success"

    return "Not allowed", 405

@app.route("/api/improve", methods=["POST"])
def improve_text():
    global requested_text

    if request.method == "POST":
        body = request.get_json()
        requested_text = body["text"]
        
        return "OK", 200
    
    return "Not allowed", 405 

@socketio.on("improve")
def handle_improve():
    logging.info("connected")

    async def fetch_response():
         async for response in fetch_ai_response():
            send(response)
        
    asyncio.run(fetch_response())

instruction = ""
requested_text = ""

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080) # dev mode
