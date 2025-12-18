const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Шаблон страницы
const pageTemplate = (content) => ` 
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BMI Calculator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f4f4f9;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        form {
            margin-top: 20px;
        }
        label {
            font-size: 1.2em;
            margin: 10px 0;
            display: block;
        }
        input[type="number"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            padding: 10px 20px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background-color: #218838;
        }
        .result-container {
            text-align: center;
        }
        .error {
            color: red;
            font-size: 1.5em;
        }
        .category {
            font-size: 1.5em;
            font-weight: bold;
        }
        table {
            margin-top: 20px;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
        }
        table, th, td {
            border: 1px solid #ddd;
            border-collapse: collapse;
        }
        th, td {
            padding: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>
`;

// Главная страница с формой
app.get('/', (req, res) => {
    const form = `
        <h1>Калькулятор Индекса Массы Тела (BMI)</h1>
        <form action="/calculate-bmi" method="POST">
            <label for="weight">Вес (кг):</label>
            <input type="number" step="0.1" name="weight" placeholder="70.5" required>

            <label for="height">Рост (см):</label>
            <input type="number" name="height" placeholder="175" required>

            <p>Введите свой рост в сантиметрах!</p>

            <button type="submit">Рассчитать BMI</button>
        </form>
    `;
    res.send(pageTemplate(form));
});

// Обработка запроса для расчета BMI
app.post('/calculate-bmi', (req, res) => {
    const weight = parseFloat(req.body.weight);
    const heightCm = parseFloat(req.body.height);

    if (isNaN(weight) || isNaN(heightCm) || weight <= 0 || heightCm <= 0) {
        return res.send(pageTemplate(`
            <div class="error">
                Ошибка ввода: введите правильные положительные числа!
                <a href="/">← Назад</a>
            </div>
        `));
    }

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);

    let category, color;
    if (bmi < 18.5) {
        category = 'Недовес';
        color = '#e74c3c';
    } else if (bmi < 25) {
        category = 'Нормальный вес';
        color = '#27ae60';
    } else if (bmi < 30) {
        category = 'Избыточный вес';
        color = '#f39c12';
    } else {
        category = 'Ожирение';
        color = '#c0392b';
    }

    const result = `
        <div class="result-container">
            <h1>Ваш BMI: ${bmi.toFixed(2)}</h1>
            <p class="category" style="color: ${color};">Категория: ${category}</p>
            <table>
                <tr><th>Вес</th><th>Рост</th><th>BMI</th></tr>
                <tr><td>${weight} кг</td><td>${heightCm} см</td><td>${bmi.toFixed(2)}</td></tr>
            </table>
            <a href="/">← Рассчитать снова</a>
        </div>
    `;
    res.send(pageTemplate(result));
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
