import docker
import subprocess
import re

def get_docker_logs():
    try:
        client = docker.from_env()
        container = client.containers.get('express_api')

        log_output = container.logs().decode('utf-8')

        logs = re.sub(r'\x1b[^m]*m', '', log_output)

        return logs
    except Exception as e:
        print("Error:", e)
        return "Error retrieving docker logs"


def get_ec2_logs():
    try:
        cmd = '/usr/bin/tail -n 100 /var/log/syslog /var/log/auth.log'
        result = subprocess.check_output(cmd.split()).decode('utf-8')

        return result
    except Exception as e:
        print("Error:", e)
        return "Error retrieving ec2 logs"