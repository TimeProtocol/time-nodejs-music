//  tools.js
//  ========

const ethers = require('ethers');
const debug = require('./debug.js');

module.exports = {

    getRandomInt: function() {
        return Math.floor(Math.random() * max); 
    },

    balanceOf: async function(user_address = -1) {
        const abi = [
            "function balanceOf(address, uint) public view returns (uint256)",
        ];

        //  test erc1155 NFT
        var token_address = "0x886373c9d3EC58f34416680b5C535C7CA3657af3";
        var nft_address = "0x0d81E7f628282Ba4e7df2c89E5108eC75a482b35";
        var token_id = "0";

        if (user_address != -1) {
            nft_address = user_address;
        }

        const provider = new ethers.providers.InfuraProvider(
            process.env.ETHEREUM_NETWORK,
            process.env.INFURA_API_KEY
        );

        try {
            let contract = new ethers.Contract(token_address, abi, provider);
            var amount = await contract.balanceOf(nft_address, token_id);
            var newAmount = parseInt(amount);
            return newAmount;
        } catch(err) {
            debug.error(err);
        }
    },

    getCurrentTimeString: function() {
        var date = new Date();
        var hour = date.getHours();
        if (hour > 12) hour = hour - 12;
        var minutes = date.getMinutes();
        if (minutes < 10) {
            var temp = "0";
            temp += String(minutes);
            minutes = temp;
        }
        var seconds = date.getSeconds();
        if (seconds < 10) {
            var temp = "0";
            temp += String(seconds);
            seconds = temp;
        }

        var time = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${hour}:${minutes}:${seconds}`;

        return time;
    },

    getCurrentTimeMS: function() {
        var time = Date.now();
        return time;
    },

    breakApartTime: function(string) {
        var year = 0;
        var month = 0;
        var day = 0;
        var hour = 0;
        var minute = 0;
        var second = 0;

        var state = 0;
        
        let temp = "";
        for(var i=0;i<string.length;i++) {
            var char = string.charAt(i);
            //debug.log(char);
            switch(state) {
                //  year
                case 0:
                    if (char == "-") {
                        year = Number(temp);
                        temp = "";
                        state++;
                        //debug.log(`[${year}]`);
                    } else temp += char;
                break
                //  month
                case 1:
                    if (char == "-") {
                        month = Number(temp);
                        temp = "";
                        state++;
                        //debug.log(`[${month}]`);
                    } else temp += char;
                break
                //  day
                case 2:
                    if (char == " ") {
                        day = Number(temp);
                        temp = "";
                        state++;
                        //debug.log(`[${day}]`);
                    } else temp += char;
                break
                //  hour
                case 3:
                    if (char == ":") {
                        hour = Number(temp);
                        temp = "";
                        state++;
                        //debug.log(`[${hour}]`);
                    } else temp += char;
                break
                //  minute
                case 4:
                    if (char == ":") {
                        minute = Number(temp);
                        temp = "";
                        state++;
                        //debug.log(`[${minute}]`);
                    } else temp += char;
                break
                //  second
                case 5:
                    if (i == string.length-1) {
                        temp += string.charAt(i);
                        second = Number(temp);
                        temp = "";
                        state++;
                        //debug.log(`[${second}]`);
                    } else temp += char;
                break
            }
        }

        return {
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            second: second,
        }
    },

    //  returns true if the first string1 is equal to or further than the second string
    compareTimes: function(date1, date2) {

        if (date1 > date2) return true;
        else return false;

        //var data1 = this.breakApartTime(date1);
        //var data2 = this.breakApartTime(date2);

/*         var date1FurtherAhead = false;
        //  compare
        if (data1.year > data2.year) {
            date1FurtherAhead = true;
        }
        
        if (data1.month > data2.month) {
            date1FurtherAhead = true;
        }

        if (data1.day > data2.day) {
            date1FurtherAhead = true;
        }

        if (data1.hour > data2.hour) {
            date1FurtherAhead = true;
        }

        if (data1.minute > data2.minute) {
            date1FurtherAhead = true;
        }

        if (data1.second > data2.second) {
            date1FurtherAhead = true;
        }

        debug.log(`date: ${date1FurtherAhead}`);

        return date1FurtherAhead; */
    }

}