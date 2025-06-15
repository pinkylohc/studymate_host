quiz_data = '''{
    "quiz": [
        {
            "type": "T/F",
            "question": "Is inheritance a feature of OOP?",
            "point": 3,
            "answer": "True",
            "choices": ["True", "False"],
            "code": "class Animal:\\n    def __init__(self, name):\\n        self.name = name\\n\\nclass Dog(Animal):\\n    def bark(self):\\n        return f'{self.name} says woof!'\\n\\ndog = Dog('Buddy')\\nprint(dog.bark())  # Buddy says woof!",
            "user_answer": ["True"]
        },
        {
            "type": "MC",
            "question": "Which of the following is not a principle of OOP?",
            "point": 3,
            "choices": ["Encapsulation", "Polymorphism", "Abstraction", "Compilation"],
            "answer": "Compilation",
            "user_answer": ["Abstraction"]
        },
        {
            "type": "Fill_blank",
            "question": "The process of hiding the internal details of an object is called ___.",
            "point": 3,
            "answer": "Encapsulation",
            "user_answer": ["idk"]
        },
        {
            "type": "Ordering",
            "question": "Order the following steps in the process of creating an object in OOP.(Drag and drop from top to bottom)",
            "point": 3,
            "choices": ["Define a class", "Use an object", "Define methods", "Create the object"],
            "answer": ["Define a class", "Define methods", "Create an object", "Use the object"],
            "user_answer": ["Define a class", "Define methods", "Use an object", "Create the object"]
        },
        {
            "type": "Short_qs",
            "question": "What is a constructor in a class?",
            "point": 3,
            "answer": "A constructor is a special method that is automatically called when an object of a class is created.",
            "code": "class Person:\\n    def __init__(self, name, age):\\n        self.name = name\\n        self.age = age\\n\\nperson = Person('Alice', 30)\\nprint(person.name)  # Alice\\nprint(person.age)   # 30",
            "user_answer": ["mou"]
        },
        {
            "type": "Long_qs",
            "question": "Explain the concept of polymorphism in OOP with an example.",
            "point": 3,
            "answer": "Polymorphism in OOP is the ability of different objects to respond to the same function call in different ways. For example, a base class 'Shape' might have a method 'draw'. Subclasses like 'Circle' and 'Square' can override the 'draw' method to provide their specific implementations. When you call 'draw' on a 'Shape' object, the correct method for the actual object type (Circle or Square) is called.",
            "code": "class Shape:\\n    def draw(self):\\n        raise NotImplementedError('Subclasses should implement this method')\\n\\nclass Circle(Shape):\\n    def draw(self):\\n        return 'Drawing a circle'\\n\\nclass Square(Shape):\\n    def draw(self):\\n        return 'Drawing a square'\\n\\nshapes = [Circle(), Square()]\\nfor shape in shapes:\\n    print(shape.draw())",
            "user_answer": ["it is method that ...."]
        },
        {
            "type": "Short_qs",
            "question": "What will be the output of the following code?",
            "point": 3,
            "answer": "10",
            "code": "class MyClass:\\n    def __init__(self, value):\\n        self.value = value\\n\\n    def increment(self):\\n        self.value += 1\\n\\nobj = MyClass(5)\\nobj.increment()\\nobj.increment()\\nprint(obj.value)  # What will be the output?",
            "user_answer": [""]
        },
        {
            "type": "T/F",
            "question": "Will the following code raise an error?",
            "point": 3,
            "answer": "True",
            "choices": ["True", "False"],
            "code": "class Base:\\n    def __init__(self):\\n        print('Base init')\\n\\nclass Derived(Base):\\n    def __init__(self):\\n        print('Derived init')\\n\\nobj = Derived()  # Will this raise an error?",
            "user_answer": ["True"]
        }
    ]
}'''