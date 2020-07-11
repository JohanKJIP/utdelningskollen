from flask import Flask, escape, request, render_template, make_response, redirect, url_for
app = Flask(__name__)

@app.route('/')
def main():
    return 'todo'

@app.route('/analys')
def utdelning():
    return render_template('analys.html')

@app.route('/faq')
def faq():
    return 'todo'

@app.route('/instruktioner')
def instructions():
    return 'todo'

@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0')
