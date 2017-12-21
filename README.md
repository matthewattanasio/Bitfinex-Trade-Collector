## Why
Retrieve your balance history and trade history in csv format given a certain date range. This is mainly used for tax purposes.

## Installation
```
npm -i
```

## Setup
- Retreive your bitfinex api key and secret from bitfinex.com
- Create a .env file in the following format
```
BFX_API_KEY={YOUR_KEY}
BFX_API_SECRET={YOUR_SECRET}
```
- Set the date ranges you need to retrieve your trade history and balance history from (MUST BE IN 3 MONTH INTERVALS). This part needs to be more dynamic
