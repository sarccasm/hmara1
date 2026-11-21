# Лабораторна робота: Контейнеризація вебзастосунку для хмарного середовища

**Виконав:** Фівко Артем, група 402  
**Дисципліна:** Хмарні технології

## Мета
Створити REST API на Node.js/TypeScript, підключити PostgreSQL і запустити сервіси в ізольованих Docker-контейнерах за допомогою Docker Compose. Дослідити health checks та постійне зберігання даних.

## Архітектура
```
Клієнт (curl/Postman)
       |
       v
localhost:3000 -> Docker: API (Node.js + Express)
                          |
                          v
                     Docker: PostgreSQL
                          |
                          v
                   postgres_data volume
```

## Підготовка
Потрібен Docker Desktop або Docker Engine з Compose. Перевірити: `docker --version` і `docker compose version`.

## Запуск
```bash
cp .env.example .env
# Для локального тесту можна залишити приклад, для публічного сервера обов'язково змінити пароль
 docker compose up --build -d
 docker compose ps
```

## Тестування
```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Перевірити Docker Compose"}'
curl http://localhost:3000/tasks
curl -X PATCH http://localhost:3000/tasks/1 -H 'Content-Type: application/json' -d '{"completed":true}'
curl http://localhost:3000/tasks
```

## Перевірка збереження даних
```bash
docker compose restart
curl http://localhost:3000/tasks
```
Після перезапуску дані повинні залишитися завдяки іменованому тому `postgres_data`. Для зупинки: `docker compose down`. **Не використовувати `docker compose down -v`, якщо дані потрібно зберегти.**

## Що продемонструвати викладачу
1. `docker compose ps`: обидва сервіси запущені.
2. `/health`: API успішно підключається до PostgreSQL.
3. `POST /tasks`: створення запису.
4. `GET /tasks`: читання з бази даних.
5. `PATCH /tasks/1`: оновлення статусу.
6. `docker compose restart` і повторний `GET /tasks`: дані збережено.

Зробіть власні скриншоти команд і відповідей у папці `screenshots/`. Результати не заявляються як перевірені, поки ви не запустите проєкт.

## Висновок
У роботі реалізовано двосервісну контейнеризовану архітектуру з API, базою даних, перевіркою готовності PostgreSQL та постійним зберіганням даних. Docker Compose дає змогу відтворити середовище на іншому комп'ютері або сервері. Для повноцінного хмарного розгортання потрібні окремий хмарний хостинг, налаштування секретів, HTTPS та мережевої безпеки.
