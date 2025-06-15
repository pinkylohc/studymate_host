## this is the sample json pass for grading
## this is similar to the sample_quiz.py which return as the user quiz generator request
## only a new col add for user answer



## [new] user_answer=[] // null for no ans
quiz_data = '''{
    "quiz": [
        {
            "type": "T/F",
            "question": "Is inheritance a feature of OOP?",
            "answer": "True",
            "choices": ["True", "False"],
            "code": """
                class Animal:
                    def __init__(self, name):
                        self.name = name

                class Dog(Animal):
                    def bark(self):
                        return self.name says woof!"

                dog = Dog("Buddy")
                print(dog.bark())  # Buddy says woof!
                """,
            "user_answer": ['False']
        },
        {
            "type": "MC",
            "question": "Which of the following is not a principle of OOP?",
            "choices": ["Encapsulation", "Polymorphism", "Abstraction", "Compilation"],
            "answer": "Compilation",
            'user_answer': ['Abstraction']
        },
        {
            "type": "Fill_blank",
            "question": "The process of hiding the internal details of an object is called ___.",
            "answer": "Encapsulation",
            'user_answer': ['idk']
        },
        {
            "type": "Ordering",
            "question": "Order the following steps in the process of creating an object in OOP.(Drag and drop from top to bottm)",
            "choices": ["Define a class", "Use an object", "Define methods", "Create the object", ],
            "answer": ["Define a class", "Define methods", "Create an object", "Use the object"],
            'user_answer': ['Define a class', 'Define methods', 'Use an object', 'Create the object']
        },
        {
            "type": "Short_qs",
            "question": "What is a constructor in a class?",
            "answer": "A constructor is a special method that is automatically called when an object of a class is created.",
            "code": """
                class Person:
                    def __init__(self, name, age):
                        self.name = name
                        self.age = age

                person = Person("Alice", 30)
                print(person.name)  # Alice
                print(person.age)   # 30
                """,
            'user_answer': ['mou']
        },
        {
            "type": "Long_qs",
            "question": "Explain the concept of polymorphism in OOP with an example.",
            "answer": "Polymorphism in OOP is the ability of different objects to respond to the same function call in different ways. For example, a base class 'Shape' might have a method 'draw'. Subclasses like 'Circle' and 'Square' can override the 'draw' method to provide their specific implementations. When you call 'draw' on a 'Shape' object, the correct method for the actual object type (Circle or Square) is called.",
            "code": """
                class Shape:
                    def draw(self):
                        raise NotImplementedError("Subclasses should implement this method")

                class Circle(Shape):
                    def draw(self):
                        return "Drawing a circle"

                class Square(Shape):
                    def draw(self):
                        return "Drawing a square"

                shapes = [Circle(), Square()]
                for shape in shapes:
                    print(shape.draw())
                """,
            'user_answer': ['it is method that ....']
        },
        {
            "type": "Short_qs",
            "question": "What will be the output of the following code?",
            "answer": "10",
            "code": """
                class MyClass:
                    def __init__(self, value):
                        self.value = value

                    def increment(self):
                        self.value += 1

                obj = MyClass(5)
                obj.increment()
                obj.increment()
                print(obj.value)  # What will be the output?
                """,
            'user_answer': ['']
        },
        {
            "type": "T/F",
            "question": "Will the following code raise an error?",
            "answer": "True",
            "choices": ["True", "False"],
            "code": """
                class Base:
                    def __init__(self):
                        print("Base init")

                class Derived(Base):
                    def __init__(self):
                        print("Derived init")

                obj = Derived()  # Will this raise an error?
                """,
                'user_answer': ['True']
        }
    ]
}'''
