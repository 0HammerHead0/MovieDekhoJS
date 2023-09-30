var app = new Vue ({
    el:'#app',
    template:`
    <div>
        <ul> <li v-for="message in messages"> {{message}} </li>
        </ul>
    </div>`,
    data: {
        messages: []
    },
    mounted: function () {
        source = new EventSource("/stream");
        source. addEventListener ('summary', event => {
            // let data = JSON.parse(event.data);
            this.messages.push(JSON.parse(event.data).message)
        }, false);
    },
    created:function(){
        console.log("js works")
    }
});