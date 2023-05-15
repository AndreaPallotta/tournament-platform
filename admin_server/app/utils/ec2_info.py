import boto3
import psutil
import os
import platform

def get_ec2_info():
    try:
        session = boto3.Session(region_name='us-east-1')
        ec2_client = session.client('ec2')

        instance_info = ec2_client.describe_instances()

        instance_list = []

        for reservation in instance_info['Reservations']:
            instance = reservation.get('Instances', [{}])[0]

            instance_id = instance.get("InstanceId", "")
            instance_name = instance.get("KeyName", "")
            instance_type = instance.get("InstanceType", "")
            status = instance.get("State", {}).get("Name", "Unknown")
            public_ip_address = instance.get("PublicIpAddress", "")
            public_dns = instance.get("PublicDnsName", "")
            private_ip_address = instance.get("PrivateIpAddress", "")
            launch_time = instance.get("LaunchTime", "").strftime("%Y-%m-%d %H:%M:%S")

            instance_list.append({
                "Instance ID": instance_id,
                "Instance Name": instance_name,
                "Instance Type": instance_type,
                "Status": status,
                "Public IP": public_ip_address,
                "Public DNS": public_dns,
                "Private IP": private_ip_address,
                "LaunchTime": launch_time
            })

        return instance_list
    except Exception as e:
        print("Error:", e)
        return {}

def get_system_info():

    # cpu
    cpu_percent = psutil.cpu_percent(interval=1)

    # memory
    mem = psutil.virtual_memory()
    mem_total = round(mem.total / (1024  ** 3), 2)
    mem_used = round(mem.used / (1024.0 ** 3), 2)
    mem_percent = mem.percent

    # disk
    disk = psutil.disk_usage("/")
    disk_total = round(disk.total / (1024.00 ** 3), 2)
    disk_used = round(disk.used / (1024.0 ** 3), 2)
    disk_percent = disk.percent

    # network
    net_io_counters =  psutil.net_io_counters()
    net_bytes_sent = round(net_io_counters.bytes_sent / (1024.0 ** 2), 2)
    net_bytes_recv = round(net_io_counters.bytes_recv / (1024.0 ** 2), 2)

    # os
    uptime = os.popen('uptime -p').read().strip()
    kernel_version = os.popen('uname -r').read().strip()
    if platform.system() == 'Linux':
        load_avg = os.getloadavg()
    else:
        load_avg = (-1.0, -1.0, -1.0)

    # architecture
    architecture = platform.architecture()

    return {
        "cpu_percent": cpu_percent,
        "memory": {
            "Total": mem_total,
            "Used": mem_used,
            "Percentage": mem_percent
        },
        "disk": {
            "Total": disk_total,
            "Used": disk_used,
            "Percentage": disk_percent
        },
        "net": {
            "Bytes Sent": net_bytes_sent,
            "Bytes Received": net_bytes_recv
        },
        "os": {
            "Uptime": uptime,
            "Average Load": load_avg,
            "Kernel Version": kernel_version,
            "Architecture": architecture
        }
    }
