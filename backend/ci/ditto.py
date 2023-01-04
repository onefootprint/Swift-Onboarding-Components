# 
# A simple python echo http webserver at POST /
#

from aiohttp import web
import asyncio
import threading


def start_proxy_server(port):
    def server():
        async def echo_handler(request):
            body = await request.text()
            response = web.Response(headers=request.headers, body=body)
            await response.prepare(request)
            return response

        app = web.Application()
        app.router.add_post("/", echo_handler)
        runner = web.AppRunner(app)
        return runner

    def run_server(runner, port):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(runner.setup())
        site = web.TCPSite(runner, 'localhost', port)
        loop.run_until_complete(site.start())
        loop.run_forever()

    app = server()
    t = threading.Thread(target=run_server, args=(app, port,))
    t.start()


start_proxy_server(8787)
while True:
    continue
