# run in localhost

1. clone this repo
2. open the repo folder in editor

## frontend
1. please install nodejs (version > 18.17.0) from it website (https://nodejs.org/en/download/prebuilt-installer/current) 

you can use ```node --v``` to check your installation

2. in terminal use ```cd next_app``` to the frontend folder

3. run ```npm install``` to install all node package

4. run ```npm run dev``` to run the next js app

5. in broswer, open ```http://localhost:3000```, you should see the webpage

* please refer to next_app/README.md for more detail
* routering may need more time for inital load the web page



## python server
fastAPI is used for http request

1. please install python from website (https://www.python.org/downloads/)

2. in another terminal use ```cd python_server``` to the frontend folder

3. please use ```pip install -r requirements.txt``` to install all the dependencies, please add the dependencies here for other needed packages 
* remarks: you may need to use other like ```python3 -m pip install -r requirements.txt``` depned on your OS

4. run ```uvicorn main:app --reload``` to start the application

5. in broswer, open ```http://localhost:8000``` you should see a 'hello world' JSON

6. please refer to the file python_server/main.py to all the api call

# Database
## Postgre SQL
## Chroma database



# Deployment (not comfirmed)
## next_app
1. next_fyp -> vercel 

## python_server
1. python_server -> AWS 
