/**
 * Created by smilev on 27/09/2016.
 */

var tag = document.getElementById('youtube-player')
if (!tag) {

    tag = document.createElement('script');
    tag.id = 'youtube-player';
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {

    var sections = document.querySelectorAll('.sm-with-video-background')

    if (sections.length > 0) {
        Object.keys(sections).forEach(function (key) {

            var section = sections[key];
            var youtube_iframe = document.querySelector('#youtube_' + section.id);

            if (youtube_iframe) {
                var player = new YT.Player('youtube_' + section.id, {
                    events: {
                        'onReady': onPlayerReady
                    }
                });
            }
        });
    }
}
function onPlayerReady(event) {
    event.target.playVideo()
    event.target.setVolume(0)
}


