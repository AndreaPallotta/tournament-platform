#/usr/bin/env python3

from flask import Flask
from flask_cors import CORS
from .utils.docker_info import get_docker_info
from .utils.ec2_info import get_ec2_info, get_system_info
from .utils.logs import get_ec2_logs, get_docker_logs

app = Flask(__name__)
CORS(app)

@app.route("/flask/admin_info")
def get_admin_info():
    docker_info = get_docker_info()
    ec2_info = get_ec2_info()
    system_info = get_system_info()

    return {
        "docker": docker_info,
        "ec2": ec2_info,
        "system_info": system_info
    }

@app.route("/flask/logs")
def get_logs():
    ec2_logs = get_ec2_logs()
    docker_logs = get_docker_logs()

    return {
        "ec2": ec2_logs,
        "docker": docker_logs
    }
