
bind = "0.0.0.0:8000"

workers = 1

proxy_allow_ips = '0.0.0.0'

#region Log Handler

accesslog = "-"
errorlog = "-"

capture_output = True

loglevel = "debug"

# endregion

worker_class = 'uvicorn.workers.UvicornWorker'