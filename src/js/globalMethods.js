//import $ from 'jquery';
//import api from '../configs/api.js';

export const globalMethods = {
    methods: {
        setJwtInLocalStorage: function (jwt) {
            localStorage.setItem("wh_jwt", jwt);
        },
        removeJwtFromLocalStorage: function () {
            localStorage.removeItem("wh_jwt");
        },
        getJwtFromLocalStorage: function () {
            let jwt = localStorage.getItem("wh_jwt");
            return jwt;
        },
        resetResponseClass: function (object) {
            if (object.hasClass("success")) {
                object.removeClass("success");
            }
            if (object.hasClass("error")) {
                object.removeClass("error");
            }
        }
    },
    data() {
        return {
            
        }
    }
}