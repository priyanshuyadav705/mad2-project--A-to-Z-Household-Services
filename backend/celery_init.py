from celery import Celery, Task


def celery_init_app(app):
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object({
        'broker_url': app.config['CELERY_BROKER_URL'],
        'result_backend': app.config['CELERY_RESULT_BACKEND'],
        'broker_connection_retry_on_startup': app.config['CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP'],
        'timezone': 'Asia/Kolkata',
    })
    
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app
                             