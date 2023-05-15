#/usr/bin/env bash

WORKING_DIR="/home/ubuntu/admin_server"

set_venv() {
    cd $WORKING_DIR

    if [[ -d env ]]; then
        rm -rf env/
    fi

    python3 -m venv env
    source env/bin/activate
    pip3 install -r requirements.txt
}

(set_venv)
