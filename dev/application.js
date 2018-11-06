const app = new Vue({
    el: "#app",
    data: {
        isLoading: true,
        type: "projects",
        currentMonth: 0,
        months: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "June",
            "July",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ]
    }
});

const loadData = (url) => {
    Vue.set(app, "isLoading", true);
    //TODO: load data
    setTimeout(()=> {
        console.log("done");
        Vue.set(app, "isLoading", false);
    }, 1)
}

const changeType = (type) => {
    Vue.set(app, "type", type);
    loadData(`/api/data/${type}`);
}

const setMonth = (month) => {

}

window.addEventListener("load", ()=>{
    loadData("");
})