
bind = "0.0.0.0:8000"

proxy_allow_ips = '0.0.0.0'

reload = True

#region Log Handler

accesslog = "-"
errorlog = "-"

capture_output = True

loglevel = "debug"

# endregion

worker_class = 'uvicorn.workers.UvicornWorker'

reload_engine = 'auto'

reload_dirs = ['/var/conf/ft_transcendence/']

timeout = 1