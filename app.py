from flask import Flask, escape, request, render_template, make_response, redirect, url_for
app = Flask(__name__)

@app.route('/')
def main():
    return render_template('divanalysis.html')

#@app.route('/analys')
#def utdelning():
#    return render_template('divanalysis.html')

@app.route('/instruktioner')
def instructions():
    return render_template('instructions.html')

@app.route('/verktyg')
def calculator():
    return render_template('calculator.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0')
