function DCEL(v) {
    this.v = v;
    this.e = [];
    this.he = {};
    this.hn = {};
    var n = v.length;
    for (var i = 0; i< v.length; i++) {
        var t = v[i];
        if (i == 0) {
            t.prev = v[n-1];
        }
        else {
            t.prev = v[i-1];
        }
        t.next = v[(i+1)%n];
        this.hn[t.idx] = t;
    }

    //create edges
    for (var i = 0; i < n; i++) {
        var e = new Edge(v[i], v[(i+1)%n]);
        e.idx = v[i].idx;
        this.he[e.idx] = e;
        e.org = v[i];
        v[i].inc_edge = e;
        e.targ = v[(i+1)%n];
        this.e.push(e);
    }
    for (var i = 0; i < n; i++) {
        this.e[i].prev = i == 0 ? this.e[n-1] : this.e[i-1];
        this.e[i].next = this.e[(i+1)%n];
    }
}
DCEL.prototype = {
    'constructor': DCEL,
    'getNode': function(idx) {
        return this.hn[idx];
    }
}
