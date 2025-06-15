# HTTP call
* please note that all the http call are done in main.py, u can refer to main.py for detail of each HTTP
* the localhost server is ```http://localhost:8000```

1. / (GET)
testing request
display ```{{"message":"Hello World!!"}}```

2. /summary/submit (POST)
pass file to summary generator
return JSON for display summary

3. /quiz/submit (POST)
pass file & parameter to quiz generator
return JSON to display quiz

4. /quiz/grade (POST)
pass quiz content & user answer for grading
return JSON to display result

5. /followup-chatbot (POST)
pass quiz content, user answer and chat message
return the chat response