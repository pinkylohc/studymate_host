# a sample return of the result
# total score - total score of the quiz, can in any string format (10/100, 4/23...)
# result - for each qs in sample_quiz_user_input.py, return the py for each qs in the same order
###### correct - the correct/wrong message/score (e.g. 'correct', 'wrong', '2/4')
##### explanation - the explanation of grading/ans

## feel free the change the schemas
## if channge the schemas, plz also change # please modify next_app/component/quiz_result/quiz_display, which display the answer with qs


quiz_return_result = {
    "total_score": '9/20',
    "result": [
        {
            "correct": '1/1',
            "explanation": "Inheritance is indeed a feature of OOP."
        },
        {
            "correct": '0/1',
            "explanation": "Compilation is not a principle of OOP."
        },
        {
            "correct": '1/2',
            "explanation": "Encapsulation is the process of hiding the internal details of an object."
        },
        {
            "correct": '2/4',
            "explanation": "The correct order is: Define a class, Define methods, Create an object, Use the object."
        },
        {
            "correct": '1/3',
            "explanation": "A constructor is a special method that is automatically called when an object of a class is created."
        },
        {
            "correct": '2/6',
            "explanation": "Polymorphism in OOP is the ability of different objects to respond to the same function call in different ways."
        },
        {
            "correct": '2/2',
            "explanation": "The output of the code is 10."
        },
        {
            "correct": '0/1',
            "explanation": "The code will raise an error because the Base class constructor is not called in the Derived class."
        }
    ]
}