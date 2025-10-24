# m2-syndicate-atomichack3.0


[![Python Version](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/release/python-3120/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3-green.svg)](https://vuejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://example.com)

## 📖 Описание

**m2-syndicate-atomichack3.0** — цифровой помощник конструктора для автоматизированной проверки технической документации на соответствие стандартам ГОСТ. Проект включает backend на FastAPI и frontend на Vue.js.

**Роли**:
- **Developer**: Загрузка документов, получение отчетов.
- **Norm Controller**: Проверка и принятие/отклонение замечаний.
- **Admin**: Управление пользователями и настройками.

**Преимущества**:
- Автоматический анализ PDF/TXT по ГОСТ.
- Подсчет времени исправлений с учетом рабочего графика.
- Экспорт данных в CSV.
- JWT-аутентификация.

## ✨ Функции

- **Загрузка и анализ**: Проверка PDF/TXT на соответствие ГОСТ.
- **История**: Просмотр версий, статусов и нарушений.
- **Анализ процессов**: Время на исправления/проверки (дни, часы, минуты).
- **Статистика**: Агрегаты по ГОСТ.
- **Админ-панель**: Управление пользователями и рабочим временем.
- **Экспорт**: CSV-отчеты.

## 🛠 Технологии

### Backend (NGTU_Atomichack3_back_api)
- **Framework**: FastAPI
- **База данных**: SQLAlchemy (SQLite/PostgreSQL)
- **Аутентификация**: JWT (python-jose)
- **Парсинг**: Custom scripts (criterion_*.py)
- **Утилиты**: Worktime calculation
- **Зависимости**: requirements.txt

### Frontend (vue-digital-assistant-enginee)
- **Framework**: Vue.js 3 + Vite
- **UI**: Lucide Icons, Tailwind CSS
- **Роутинг**: Vue Router
- **Состояние**: Pinia
- **API**: Custom (api.ts)

## 📦 Установка

### Требования
- Python 3.12+
- Node.js 18+
- Git

### Шаги

1. **Клонирование**:
   ```bash
   git clone https://github.com/yourusername/m2-syndicate-atomichack3.0.git
   cd m2-syndicate-atomichack3.0
   ```

2. **Backend**:
   ```bash
   cd NGTU_Atomichack3_back_api
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8234
   ```

3. **Frontend**:
   ```bash
   cd ../vue-digital-assistant-enginee
   npm install
   npm run dev
   ```

4. **Настройка**:
   - Создайте `.env` с `SECRET_KEY`.
   - Настройте `worktime_config.json`.

API: `http://localhost:8234`, Frontend: `http://localhost:5173`.

## 🚀 Использование

1. **Регистрация/Логин**: Через `/login` или админ-панель.
2. **Загрузка**: FileUpload.vue для PDF.
3. **Результаты**: ResultPage.vue для отчетов.
4. **Анализ**: ProcessAnalysisPage.vue.
5. **Админ**: AdminPanelPage.vue.

**API**:
- `POST /upload`: Загрузка файла.
- `GET /history`: История.
- `GET /process-analysis`: Анализ.

## 📊 Примеры

### Отчет
```
Total Violations: 5
Error Points:
- 1.1.1: 2
- 1.1.2: 3
```

### Статистика
- Среднее время исправления: 1.5 дня.
- Итерации: 2.


---

Issues и PR приветствуются! 🎉
