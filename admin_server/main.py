#/usr/bin/env python3

from app.app import app

if __name__ == "__main__":
    app.run(debug=True, port=5001, host="0.0.0.0")
