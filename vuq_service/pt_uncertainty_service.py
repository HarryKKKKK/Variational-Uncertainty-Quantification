from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from flask_cors import CORS 

app = Flask(__name__)
#  TODO: change this
CORS(app) 

def receive_data(request_data):
    """Recieve data and transfer to dataframe for further process."""
    points = request_data.get('points', [])
    return pd.DataFrame(points, columns=['x', 'y', 'color'])

def process_data(df):
    """Placeholder algorithm to process data."""
    point_count = len(df)/10
    
    x_range = np.arange(-4.5, 5, 0.5)
    y_range = np.arange(-4.5, 5, 0.5)
    
    total = np.zeros((len(y_range), len(x_range)))
    aleatoric = np.zeros((len(y_range), len(x_range)))
    epistemic = np.zeros((len(y_range), len(x_range)))
    for i, y in enumerate(y_range):
        for j, x in enumerate(x_range):
            total[i, j] = point_count * 3 # total
            aleatoric[i, j] = point_count * 2 # aleatoric
            epistemic[i, j] = point_count   # epistemic
    
    return {
        'x_range': list(x_range),
        'y_range': list(y_range),
        'total': total.tolist(),     
        'aleatoric': aleatoric.tolist(), 
        'epistemic': epistemic.tolist() 
    }

def prepare_response(res):
    """Turn dataframe to datatype where the web can recieve"""
    return jsonify({
        'success': True,
        **res
    })

@app.route('/process_points', methods=['POST'])
def process_points():
    try:
        df = receive_data(request.json)
        res = process_data(df)
        return prepare_response(res)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)