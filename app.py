from flask import Flask, escape, request, render_template, make_response, redirect, url_for
app = Flask(__name__)


@app.route('/')
def main():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0')
