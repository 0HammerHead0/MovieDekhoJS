Pre-launch Setup

Mailhog
Before launching the application, ensure that Mailhog is set up and running on port 8025. This is essential for mail operations within the app.

To run Mailhog (assuming it's installed):

Running the Application
Once Mailhog is up and running, execute the main.py script located in the root directory:


python main.py

Redis Server
After successfully starting the application, the next step is to set up and run the Redis server. Please refer to the official Redis documentation or relevant guides to proceed.

Celery Commands
For task management and scheduling, the application uses Celery. You can start the Celery worker and beat by using the following commands:

For the worker:
celery -A main.celery_app worker -l INFO


For the beat:
celery -A main.celery_app beat -l INFO
