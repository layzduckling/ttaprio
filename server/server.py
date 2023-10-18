from flask import Flask, request, jsonify
from flask_cors import CORS

import asyncio
import json
import websockets

URI = "wss://each-xi-midi-laos.trycloudflare.com/api/v1/stream"

# app instance
app = Flask(__name__)
CORS(app)

async def fetch_ai_response():
    global instruction, requested_text

    req = {
        "prompt": requested_text,
        "max_new_tokens": 250,
        "auto_max_new_tokens": False,
        "max_tokens_second": 0,
                
        "preset": "None",
        "do_sample": True,
        "temperature": 0.7,
        "top_p": 0.1,
        "typical_p": 1,
        "epsilon_cuttoff": 0,
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

        response = ""

        while True:
            incoming_data = await websocket.recv()
            incoming_data = json.loads(incoming_data)

            match incoming_data["event"]:
                case "text_stream":
                    response += incoming_data["text"]
                case "stream_end":
                    return response

@app.route("/api/config-test", methods=["POST"])
def config_test():
    if request.method == "POST":
        global instruction

        configurations = request.get_json()
        instruction = f"나는 {configurations['publisher']} 교과서를 쓰는 {configurations['schooltype']} {configurations['semester']} 학생이야. 곧 {configurations['subject']} {configurations['title']} 수행평가를 봐야 하는데, {configurations['rubric']}에 따라서 채점 돼. 수행평가 형식은 {configurations['format']}이야."
        print(instruction)
        return "Success"

    return "Not allowed", 405

@app.route("/api/improve", methods=["POST", "GET"])
def improve_text():
    global requested_text

    if request.method == "POST":
        body = request.get_json()
        requested_text = body["text"]
        
        return "OK", 200
    elif request.method == "GET":
        response = asyncio.run(fetch_ai_response())
        return response 

    return "Not allowed", 405 

instruction = ""
requested_text = ""

if __name__ == "__main__":
    app.run(debug=True, port=8080) # dev mode
