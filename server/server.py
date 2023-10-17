from flask import Flask, request, jsonify
from flask_cors import CORS

# app instance
app = Flask(__name__)
CORS(app)

@app.route("/api/config-test", methods=["POST"])
def config_test():
    if request.method == "POST":
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
        return f"Requested: {requested_text}"

    return "Not allowed", 405 

requested_text = ""

if __name__ == "__main__":
    app.run(debug=True, port=8080) # dev mode
