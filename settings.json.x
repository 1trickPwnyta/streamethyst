{
    "serverPort": 9095,
	"logFile": "streamethyst.log",
    "chatbot": {
        "credentials": {
            "streamer": {
                "username": "yourTwitchUsername",
                "password": "oauth:..."
            },
            "bot": {
                "username": "botTwitchUsername",
                "password": "oauth:..."
            }
        },
        "channel": "yourTwitchUsername",
        "commandPrefix": "!"
    },
    "api": {
        "credentials": {
            "clientid": "yourTwitchApplicationClientId",
            "clientSecret": "yourTwitchApplicationClientSecret",
            "token": {
                "accessToken": "yourTwitchAccessToken",
                "refreshToken": "yourTwitchRefreshToken"
            }
        }
    },
    "overlay": {
        "default": {
            "width": 1920,
            "height": 1080
        }
    }
}
