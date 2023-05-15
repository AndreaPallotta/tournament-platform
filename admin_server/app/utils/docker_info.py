import subprocess
import json

def get_docker_info():
    docker_info_cmd = ["/usr/bin/docker", "inspect", "express_api", "--format={{json .}}"]

    try:
        docker_info_out = subprocess.check_output(docker_info_cmd)
        docker_info = json.loads(docker_info_out.decode('utf-8').strip())

        return {
            "Id": docker_info.get("Id", "")[:12],
            "Name": docker_info.get("Name", "")[1:],
            "Status": docker_info.get("State", {}).get("Status", ""),
            "Started At": docker_info.get("State", {}).get("StartedAt", ""),
            "App Armor": docker_info.get("AppArmorProfile", ""),
            "Image": docker_info.get("Config", {}).get("Image", ""),
            "IP": docker_info.get("NetworkSettings", {}).get("IPAddress", ""),
            "Exposed Ports": list(docker_info.get("HostConfig", {}).get("PortBindings", {}).keys())
        }
    except Exception as e:
        print("Error:", e)
        return {}