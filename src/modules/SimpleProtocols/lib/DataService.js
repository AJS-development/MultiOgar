/*
    SimpleProtocols - A protocol generator
    Copyright (C) 2017 Andrew S

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

module.exports = class DataService {
    constructor() {
        this.data = [];
        this.index = 0;
        this.append = [];
    }
    push(a) {

        this.data.splice(this.index++, 0, a)
        // console.log(this.data)
    }
    push2(a) {
        this.data.push(a);
    }
    push3(a) {
        this.data.splice(this.index, 0, a)
    }
    push4(a) {
        this.append.push(a)
    }
    end() {

        this.push(this.append[this.append.length - 1]);
        this.append.splice(this.append.length - 1, 1)

    }
    set(a, ind) {
        this.data[ind] = a;
    }
    toString() {
        return this.data.join("\n");
    }


}
