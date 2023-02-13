/**
 * Channel talk Plugin
 */
(function() {
    var w = window;
    if (w.ChannelIO) {
        return (window.console.error || window.console.log || function(){})('ChannelIO script included twice.');
    }
    var ch = function() {
        ch.c(arguments);
    };
    ch.q = [];
    ch.c = function(args) {
        ch.q.push(args);
    };
    w.ChannelIO = ch;
    function l() {
        if (w.ChannelIOInitialized) {
            return;
        }
        w.ChannelIOInitialized = true;
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
        s.charset = 'UTF-8';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
    }
    if (document.readyState === 'complete') {
        l();
    } else if (window.attachEvent) {
        window.attachEvent('onload', l);
    } else {
        window.addEventListener('DOMContentLoaded', l, false);
        window.addEventListener('load', l, false);
    }
})();
ChannelIO('boot', { // 커스터마이징 가능한 옵션들
    "pluginKey": "57a039f7-a27b-445e-8138-95c25681c917",
    "customLauncherSelector": "#channelTalk", // , id / class 여러개 선택 사용 가능
    "hideChannelButtonOnBoot": true, // 말풍선 아이콘 보이기/숨김 여부
});
