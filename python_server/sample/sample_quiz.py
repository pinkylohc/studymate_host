# a sample generated quiz (a json with a "quiz" array inside), modify the schemas if u want

# schemas - quiz[{type:"", question:"", choices:[] ,code:"", answer:""/[]}] (choices and code are optional)
# type: T/F, MC, Fill_blank, Ordering, Short_qs, Long_qs
# question: question string
# point: the score point of the qs
# answer: the answer to the qs
# choices: the choices for the qs (optional)
# code: code to display (optional)
# feel free the modif the schemas

# If change the schemas (e.g. add type)
# please modify next_app/component/generator/quiz_area.tsx -> rednerQuizDisplay(), which will display the json return
# please modify next_app/action/generator/export_quiz_pdf.tsx && export_quiz_word.tsx, which download the json return

# please modify next_app/component/quiz_result/quiz_display, which display the answer with qs

# you can try to submit a request in quiz generator page, before modify this code to see the display sample
#
quizjson ={
    "quiz": [
        {
            "type": "T/F",
            "question": "Is inheritance a feature of OOP?",
            "point": 1,
            "answer": "True",
            "choices": ["True", "False"],
            "code": """
                class Animal:
                    def __init__(self, name):
                        self.name = name

                class Dog(Animal):
                    def bark(self):
                        return f"{self.name} says woof!"

                dog = Dog("Buddy")
                print(dog.bark())  # Buddy says woof!
                """
        },
        {
            "type": "MC",
            "question": "Which of the following is not a principle of OOP?",
            "point": 1,
            "choices": ["Encapsulation", "Polymorphism", "Abstraction", "Compilation"],
            "answer": "Compilation"
        },
        {
            "type": "Fill_blank",
            "question": "The process of hiding the internal details of an object is called ___.",
            "point": 2,
            "answer": "Encapsulation"
        },
        {
            "type": "Ordering",
            "question": "Order the following steps in the process of creating an object in OOP.(Drag and drop from top to bottm)",
            "point": 4,
            "choices": ["Define a class", "Use an object", "Define methods", "Create the object", ],
            "answer": ["Define a class", "Define methods", "Create an object", "Use the object"]
        },
        {
            "type": "Short_qs",
            "question": "What is a constructor in a class?",
            "point": 3,
            "answer": "A constructor is a special method that is automatically called when an object of a class is created.",
            "code": """
                class Person:
                    def __init__(self, name, age):
                        self.name = name
                        self.age = age

                person = Person("Alice", 30)
                print(person.name)  # Alice
                print(person.age)   # 30
                """
        },
        {
            "type": "Long_qs",
            "question": "Explain the concept of polymorphism in OOP with an example.",
            "point": 6,
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
                """
        },
        {
            "type": "Short_qs",
            "question": "What will be the output of the following code?",
            "point": 2,
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
                """
        },
        {
            "type": "T/F",
            "question": "Will the following code raise an error?",
            "point": 1,
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
                """
        }
    ]
}