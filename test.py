import csv
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np

def open_data(file_name='trans.csv'):
    with open('trans.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=';')
        data = {}

        for idx, row in enumerate(csv_reader):
            if idx == 0: 
                # skip header
                continue
            date = datetime.strptime(row[0], '%Y-%m-%d')
            company = row[3]
            n_shares = row[4]
            amount = float(row[6].replace(',', '.'))

            if not(date.year in data):
                data[date.year] = []
                
            data[date.year].append({
                'date': date,
                'company': company,
                'n_shares': n_shares,
                'amount': amount
            })
        return data

def bar_representation(data):
        bar_data = {}
        for year in data:
            for transaction in data[year]:
                if not(transaction['date'].year in bar_data):
                    bar_data[transaction['date'].year] = [0] * 12
                bar_data[transaction['date'].year][transaction['date'].month-1] += transaction['amount']

        fig, ax = plt.subplots()
        ind = np.arange(12) + 1
        n_years = len(bar_data)
        width = 1/(n_years+1)

        years = sorted(bar_data.keys())
        for idx, year in enumerate(years):
            ax.bar(ind + idx*width, bar_data[year], width, label=year)

        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        ax.set_xticks(ind + width*n_years/2)
        ax.set_xticklabels(labels)
        plt.legend()
        plt.show()

def get_cmap(n, name='hsv'):
    '''Returns a function that maps each index in 0, 1, ..., n-1 to a distinct 
    RGB color; the keyword argument name must be a standard mpl colormap name.'''
    return plt.cm.get_cmap(name, n)

def accumulated(data):
    dates = []
    accumulated = []
    previous = 0

    years = sorted(data.keys())
    for year in years:
        for transaction in reversed(data[year]):
            previous += transaction['amount']
            dates.append(transaction['date'])
            accumulated.append(previous)

    fig, ax = plt.subplots()
    cmap = get_cmap(len(years))
    for idx, year in enumerate(years):
        ax.axvspan(
            datetime.strptime(f'{year}-01-01', '%Y-%m-%d'), datetime.strptime(f'{year}-12-30', '%Y-%m-%d'), alpha=0.2, color=cmap(idx)
        )
    ax.plot(dates, accumulated, color='blue', linewidth=1)
    ax.set_title('Accumulated dividends')
    plt.show()

def organic_growth():
    pass

if __name__ == "__main__":
    data = open_data(file_name='trans.csv')
    bar_representation(data)
    #accumulated(data)