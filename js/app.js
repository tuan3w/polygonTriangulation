window.onload = startApp;

document.oncontextmenu = function(e){
    e.preventDefault();
    return false;
}
Logger = {
    'log': function(){
        for (var i = 0; i < arguments.length; i++)
        console.log(arguments[i]);
    }
};

var Orientation = {
    "CW": -1,
    "CCW": 1,
    "COLLINEAR": 0
};

/*
 * Compare position of 2 points
 */
function compare(p1, p2) {
    if(p1.pos.y < p2.pos.y || (p1.pos.y == p2.pos.y && p1.pos.x > p2.pos.x))
        return -1;
    else if (p1.pos.y == p2.pos.y && p1.pos.x == p2.pos.x)
        return 0;
    else
        return 1;
}

/*
 * Reorder vertices
 */
function clockwiseReorder(list) {
    if (!isCClockwiseOrder(list))
        {
            //reorder
            for (var i = 0; i < list.length ; i++) {
                if (i == 0)
                    list[i].next = list[list.length - 1];
                else
                    list[i].next = list[(i - 1) % list.length];
                list[i].prev = list[(i+1) % list.length];
            }
        }

}

/**
 * Compare 2 edge
 * e1,e2 {Edge} edges
 */
function edgeCompare(e1,e2) {
    var list = [e1.p1, e1.p2, e2.p2, e2.p1];
    var v1,v2;
    var s = 0.0;
    for (var i = 0; i < list.length; i++) {
        v1 = list[i].pos;
        v2 = list[(i+1)%list.length].pos;
        s += (v2.x - v1.x) *(v2.y + v1.y);
    }
    if (s > 0)
        return -1;
    else if (s == 0)
        return 0;
    else
        return 1;
}
function below(p1, p2) {
    if (p1.pos.y > p2.pos.y || (p1.pos.y == p2.pos.y && p1.pos.x < p2.pos.x))
        return true;
    else
        return false;
}
function showNodes(list) {
    Logger.log('_______________________position...');
    for (var i = 0; i < list.length; i++)
    Logger.log(list[i].pos);
    Logger.log('_______________________end list position...');

}
/*
 * Check list is in counterclockwise order
 */
function isCClockwiseOrder(list) {
    var v1,v2;
    var s = 0.0;
    for (var i = 0; i < list.length; i++) {
        v1 = list[i].pos;
        v2 = list[(i+1)%list.length].pos;
        //s += (v1.x * v2.y - v2.x * v1.y);
        s += (v2.x - v1.x) *(v2.y + v1.y);
    }
    return s > 0;
}
EPSILON=Math.exp(-10);
function orient2d(pa, pb, pc) {
    pa = pa.pos;
    pb = pb.pos;
    pc = pc.pos;
    var detleft = (pa.x - pc.x) * (pb.y - pc.y);
    var detright = (pa.y - pc.y) * (pb.x - pc.x);
    var val = detleft - detright;
    if (val > -(EPSILON) && val < (EPSILON)) {
        return Orientation.COLLINEAR;
    } else if (val > 0) {
        return Orientation.CW;
    } else {
        return Orientation.CCW;
    }
}


/*
 * Add Split line
 */
function addSplitLine(v1,v2) {
    if (me[v1.idx])
        me[v1.idx].push(v2);
    else
        me[v1.idx] = [v2];

    if (me[v2.idx])
        me[v2.idx].push(v1);
    else
        me[v2.idx] = [v1];

    drawer.drawEdge(v1.pos, v2.pos);

}
/*
 * Edge class
 */
function Edge(p1,p2){
    if (p2 == undefined)
        {
            this.p1 = p1;
            this.p2 = new Node({x:p1.pos.x, y:p1.pos.y+0.01}, p1.idx+1000);
            this.idx = p1.idx + 1000;
        }
        else {
            if (below(p2,p1)) {
                this.p1 = p1;
                this.p2 = p2;
            }
            else {
                this.p1 = p2;
                this.p2 = p1;
            }

            if (p1.next == p2)
                this.idx = p1.idx;
            else
                this.idx = p2.idx;
        }

    this.helper = null;
}
Edge.prototype = {
    'constructor': Edge,
    'toString': function(){
        return '[' + this.p1.idx + ',' + this.p2.idx + ']';
    }
};




/*
 * Node class
 */
function Node(p, idx){
    this.pos = p;
    this.idx = idx;
    this.type = NodeType.NO;
    this.next = this.prev = null;
};
NodeType = {
    START: 0,
    END: 1,
    MERGE: 2,
    SPLIT: 3,
    REGULAR: 4,
    NO: 5
};
NodeTypeDes = ['START', 'END', 'MERGE', 'SPLIT', 'REGULAR'];
var Color = ['gray', 'red', 'green', "cyan", 'blue', 'yellow'];
var canAddPoint = true;


/**
 * startApp
 */
function startApp(){

    Logger.log('start app..');
    var canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    drawer = new Drawer(ctx);
    drawer.showGuide();
    points = [];
    edges = [];
    me = {};
    hn = {};
    nodes = [];
    helper =[];
    T = BST(edgeCompare);

    //ex = [[342,40],[188,75],[197,261],[276,287],[277,187],[385,191],[379,300],[326,261],[294,361],[199,358],[347,451],[508,408],[514,301],[494,241],[574,282],[545,351],[618,408],[718,303],[754,87],[603,161],[622,321],[519,178],[554,46]];
    ex = [
        [315,54],[234,30],[222,117],[279,160],[312,111],[377,156],[343,216],
        [294,199],[334,163],[187,220],[271,298],[378,313],[420,240],[485,339],
        [423,394],[357,369],[401,442],[563,444],[662,349],[527,415],[540,259],
        [588,279],[572,328],[741,274],[707,102],[629,112],[665,208],[552,208],[500,73],[438,108]
    ];
    initExample(ex);

    /**
     * init example
     */
    function initExample(list) {
        var n = list.length;
        nodes = [];
        var t;
        for (var i = 0; i < n; i++) {
            t = list[i];
            nodes.push(new Node({x:t[0], y:t[1]}, i));
        }

        dcel = new DCEL(nodes);
        drawer.drawPolygon(dcel);
    }
    tmp = [];
    he = {};

    //handle Event Listener
    canvas.addEventListener('mousedown', handleEvent);
    canvas.addEventListener('mousemove', handleEvent);
    canvas.addEventListener('mouseup', handleEvent);

    pIdx = 0;

    /**
     * Check end of polygon
     */
    function isLastPoint(p, list) {
        if (list.length == 0)
            return false;

        var fp = list[0].pos;
        return  pIdx > 0 && Math.sqrt((p.x - fp.x)*(p.x - fp.x) + (p.y - fp.y)*(p.y - fp.y)) < 10;
    }
    /*
     * Check new location is already of an old point
     * p    {object}: point location
     * list {array}: list of points
     */
    function isExistPoint(p, list) {
        var t;
        for (var i = 0; i < list.length; i++){
            t = list[i].pos;
            if (Math.sqrt((p.x - t.x)*(p.x - t.x) + (p.y - t.y)*(p.y - t.y)) < 10){
                return true;
            }
        }

        return false;
    }

    /**
     * handle Event
     */
    function handleEvent(e) {
        if (!canAddPoint)
            return;
        var pos = {x: e.offsetX , y : e.offsetY};
        switch(e.type) {
            case 'mousedown':
                if (isLastPoint(pos,nodes)) {
                    drawer.drawEdge(nodes[0].pos, nodes[pIdx-1].pos);
                    dcel = new DCEL(nodes);
                    drawer.drawPolygon(dcel);

                    edges.push([nodes[pIdx-1].pos, nodes[0].pos]);
                    canAddPoint = false;
                }
                else {
                    if (isExistPoint(pos, nodes))
                        break; //ignore

                    //tmp.push([pos.x, pos.y]);
                    var node = new Node(pos);
                    nodes.push(node);

                    if (pIdx > 0){
                        drawer.drawEdge(nodes[pIdx-1].pos, nodes[pIdx].pos);
                    }
                    node.idx = pIdx;
                    //hn[pIdx] = node;
                    drawer.drawNode(node);
                    pIdx ++;
                }
                break;
            case 'mousemove':
                //Logger.log('mousemove');
                break;
            case 'mouseup':
                //Logger.log('mouseup');
                break;
        }
    }

    // process button event
    mbtn = document.getElementById('mbtn');
    resetbtn = document.getElementById('reset');
    mbtn.addEventListener('click', triangulate, [1, 2]);
    resetbtn.addEventListener('click', reset);

    function reset() {
        tmp = [];
        pIdx = 0;
        canAddPoint = true;
        points = [];
        edges = [];
        nodes = [];
        me = {};
        he = {};
        T = new BST(edgeCompare);
        drawer.clear();
    }

    function norm(p) {
        return Math.sqrt(p.x * p.x + p.y*p.y);
    }

    function innerPolygonAngle(l,p,r) {
        var t1 = {x: l.pos.x - p.pos.x, y: l.pos.y - p.pos.y};
        var t2 = {x: r.pos.x - p.pos.x, y: r.pos.y - p.pos.y};
        var c =  (t1.x *t2.x + t1.y * t2.y) / (norm(t1)*norm(t2));
        if (c > 1)
            c = 1;
        var a = Math.acos(c);
        if (orient2d(l, p, r) == Orientation.CW){
            a = 2*Math.PI - a;
        }
        return a;
    }

    /*
     * Set Node type
     */
    function setType(p) {
        var l,r, t1, t2;
        l = p.prev;
        r = p.next;
        var a = innerPolygonAngle(l,p,r);

        if (below(p,l) && below(p,r)) {
            if (a < Math.PI)
                p.type = NodeType.END;
            else
                p.type = NodeType.MERGE;
        }
        else if (below(l,p) && below(r,p)) {
            if (a < Math.PI)
                p.type = NodeType.START;
            else
                p.type = NodeType.SPLIT;
        }
        else
            p.type = NodeType.REGULAR;
    }

    /**
     * Compute type of each vertices of polygon
     * list [array] list of vertices stored in counterclockwise order
     */
    function computePointType(list) {
        var t;
        for (var i = 0; i < list.length; i++)
        {
            t = list[i];
            setType(t);
            drawer.drawNode(t);
        }
    }

    /**
     * Handle Start vertex
     */
    function handleStartVertex(v){
        //debugger
        //v.idx = v.inc_edge.idx;
        helper[v.idx] = v;

        var t = v.inc_edge;
        var n = T.insert(t, 'noname');
        he[t.idx]  = n;
    }

    /**
     * handle End vertex
     */
    function handleEndVertex(v){
        //debugger
        //var prev = v.idx > 0 ? v.idx -1 : nodes.length - 1;
        var prevEdge = v.inc_edge.prev;
        if (prevEdge.type == NodeType.MERGE){
            addSplitLine(helper[prev],v);
            drawer.drawEdge(helper[prev].pos, v.pos);
        }

        T.remove(T.search(prevEdge));


    }

    /*
     * handle Merge vertex
     */
    function handleMergeVertex(v){
        //debugger
        Logger.log('handle Merge Vertex');
        var prevEdge = v.inc_edge.prev;
        Logger.log(prevEdge);
        if (helper[prevEdge.idx] && helper[prevEdge.idx].type == NodeType.MERGE) {
            addSplitLine(helper[prevEdge.idx],v);
        }
        T.remove(T.search(prevEdge));

        var e = new Edge(v);
        var node = T.insert(e);
        var left = T.predecessor(node);
        var leftIdx = left.key.idx;
        if (helper[leftIdx] && helper[leftIdx].type == NodeType.MERGE) {
            addSplitLine(helper[leftIdx], v);
        }

        T.remove(node);
            //debugger
        if (left) {
            helper[left.key.idx] = v;
        }

    }

    /**
     * handle Regular Vertex
     */
    function handleRegularVertex(v){
        //debugger
        var prev = v.idx > 0 ? v.idx -1 : nodes.length - 1;
        var prevEdge = v.inc_edge.prev;
        var left;
        if (below(v, v.prev)) {//interior of polygon on the right of  vertex
            if (helper[prevEdge.idx] && helper[prevEdge.idx].type == NodeType.MERGE) {
                addSplitLine(v, helper[v.prev.idx]);
            }
            T.remove(T.search(prevEdge));
            var e = T.insert(v.inc_edge);
            he[e.key.idx] = e;
            helper[e.key.idx] = v;
        }else  {
            node = T.insert(new Edge(v));
            left = T.predecessor(node);
            T.remove(node);
            leftIdx = left.key.idx;
            //he[node.idx] = node;
            if (helper[leftIdx] && helper[leftIdx].type  == NodeType.MERGE) {
                addSplitLine(helper[leftIdx], v);
            }
            helper[leftIdx] = v;
        }

    }


    /**
     * handle split vertex
     */
    function handleSplitVertex(v) {
        //debugger
        var t = T.insert(new Edge(v));
        var e = T.predecessor(t);
        if (e) {
            addSplitLine(helper[e.key.idx], v);
            helper[e.key.idx] = v;
        }
        T.remove(t);
        var e = v.inc_edge;
        t = T.insert(e);
        he[e.idx] = v;
        helper[e.idx] = v;

    }

    /**
     * Divide simple polygon to monotone
     * list [array] list of vertices in counterclockwise order
     */
    function makeMonotone(list) {
        clockwiseReorder(list);
        computePointType(list);
        drawer.drawNodes(list);

        nodes.sort(compare);

        var t;
        for (var i = 0; i < nodes.length; i++) {
            //debugger
            t = nodes[i];
            Logger.log('+++++++++++++++++++++++++++---------------------------');
            //drawer.highlight(t);
            Logger.log(nodes[i].idx);
            switch (t.type) {
                case NodeType.START:
                    handleStartVertex(t);
                break;
                case NodeType.END:
                    handleEndVertex(t);
                break;
                case NodeType.MERGE:
                    handleMergeVertex(t);
                break;
                case NodeType.SPLIT:
                    handleSplitVertex(t);
                break;
                case NodeType.REGULAR:
                    handleRegularVertex(t);
                break;
            }
        }
    }

    /**
     * show position of all nodes
     */
    function showNodes(list) {
        Logger.log('_______________________position...');
        for (var i = 0; i < list.length; i++)
        Logger.log(list[i].pos);
        Logger.log('_______________________end list position...');

    }

    /**
     * Decompose monotone into triangles
     * list [array] list of vertices of monotone
     */
    function triangulateMonotonePolygon(list) {

        list.sort(compare);
        var top = list[0];
        top.chain = 1;
        var bottom = list[list.length - 1];
        var t = top.next;
        while (t != bottom){
            t.chain = 1;
            t = t.next;
        }
        t = bottom.next;
        while (t!= top) {
            t.chain = 2;
            t = t.next;
        }
        top.chain = bottom.chain = 3;

        var s = [];
        s.push(list[0], list[1]);
        var curchain = list[1].chain;
        var c;
        var t, t1, t2;
        for (var i = 2; i < list.length - 1; i++) {
            //drawer.highlight(list[i].pos);

            c = list[i].chain;
            if (c != curchain) {
                var t1 = s[s.length - 1];

                console.log(s);
                while ( s.length > 0) {
                    t2 = s.pop();
                    if (s.length > 0) {
                        Logger.log(t2.pos);
                        //drawer.highlight(t2.pos);
                        //drawer.highlight(list[i].pos);
                        drawer.drawEdge(t2.pos, list[i].pos);
                    }
                }
                s.push(t1);
                s.push(list[i]);
            }
            else {
                t1 = s.pop();
                t2 = t1;
                while (s.length > 0 &&
                       ((orient2d(list[i], t1, s[s.length - 1]) == Orientation.CCW && c == 2)
                           || (orient2d(list[i], t1, s[s.length-1]) == Orientation.CW && c == 1))) {
                               drawer.drawEdge(list[i].pos, s[s.length - 1].pos);
                               t1 = s.pop();
                           }
                           s.push(t1);
                           s.push(list[i]);
            }
            curchain = c;
        }


        //add edge
        t = list[list.length - 1];
        s.pop();
        while(s.length > 1) {
            drawer.drawEdge(t.pos,s.pop().pos);
        }

    }

    /**
     * Triangulate simple polygon
     * l {array} store vertices of monotone
     * v {Node} current vertex
     */
    function recursiveTriangulate(l,v) {
        debugger
        for (var i = 0; i < l.length; i++)
            drawer.highlight(l[i]);
        while (v != l[0]) {
            drawer.highlight(v);
            if (!me[v.idx]) {
                //has no split line
                l.push(v);
            }
            else {
                //has split line
                var elist = me[v.idx];
                var n1,n2;
                var n = elist.length;
                for (var i = 0; i <n; i++) {
                    //create new monotone
                    var l2 = [elist[i], v];
                    n1 = elist[i].next;
                    me[elist[i].idx].splice(me[elist[i].idx].indexOf(v),1); //remove
                    elist[i].next = v;
                    recursiveTriangulate(l2,v.next);
                    //create edge
                    v.next = elist[i];
                    elist[i].next = n1;
                }

                l.push(v);
            }
            //if (v == l[0])
                //stop = true;
            v = v.next;
        }
        triangulateMonotonePolygon(l);
    }

    function triangulate(){
        T = new BST(edgeCompare);

        drawer.drawPolygon(dcel);
        makeMonotone(dcel.v);
        drawer.drawNodes(dcel.v);

        var n = nodes[0];
        while (me[n.idx])
            n = n.next;

        //reorder split edge
        for (var i in me) {
            var list = me[i];
            if (list.length > 1) {
                var t = dcel.getNode(i);
                var a1 = innerPolygonAngle(t.prev, t, list[0])* 180/Math.PI;
                var a2 = innerPolygonAngle(t.prev, t, list[list.length -1]) * 180/ Math.PI;
                if  (a1 < a2){
                    Logger.log('reorder split edge');
                    list.reverse();
                }
            }

        }
        //debugger
        recursiveTriangulate([n], n.next);
        drawer.drawNodes(dcel.v);
    }
}

function Drawer(ctx){
    this.ctx = ctx;
    this.ctx.lineWidth=2;
}
Drawer.prototype = {
    'constructor': Drawer,
    'drawNode': function(node) {
        var ctx = this.ctx;
        var pos = node.pos;
        var color = Color[node.type];
        ctx.beginPath();
        ctx.strokeStyle='black';
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle=color;
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = 'bold 12pt arial';
        ctx.textAlign='center';
        ctx.fillText(node.idx, pos.x, pos.y + 5);
        ctx.closePath();
    },
    'drawEdge': function(p1, p2) {
        this.ctx.strokeStyle='#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
        this.ctx.closePath();
    },
    'highlight': function(v){
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.fillStyle = '#000';
        this.ctx.arc(v.pos.x, v.pos.y, 16, 0, Math.PI *2);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.lineWidth = 2;
    },
    'drawNodes': function(list) {
        for (var i = 0; i < list.length; i++)
        this.drawNode(list[i]);

    },
    'showGuide': function() {
        this.ctx.textAlign = 'start';
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(0,0,150,260);
        for (var i = 0; i < Color.length - 1; i++) {
            this.ctx.beginPath();
            this.ctx.fillStyle=Color[i];
            this.ctx.arc(20,i*50 + 27,10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        }
        this.ctx.fillStyle ='black';
        this.ctx.font='12pt arial';
        this.ctx.fillText('Start Vertex',40, 27);
        this.ctx.fillText('End Vertex',40, 77);
        this.ctx.fillText('Merge Vertex',40, 127);
        this.ctx.fillText('Split Vertex',40, 177);
        this.ctx.fillText('Regular Vertex',40, 227);
        this.ctx.closePath();
    },
    'drawEdges': function(list) {
        for (var i = 0; i < list.length; i++)
        this.drawEdge(list[i].p1.pos, list[i].p2.pos);
    },
    'drawPolygon': function(dcel) {
        var vertices = dcel.v;
        var edges = dcel.e;

        //draw polygon
        this.ctx.beginPath();
        this.ctx.fillStyle='blue';
        this.ctx.moveTo(vertices[0].pos.x, vertices[0].pos.y);
        for (var i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i].pos.x, vertices[i].pos.y);
        }
        this.ctx.lineTo(vertices[0].pos.x, vertices[0].pos.y);
        this.ctx.fill();
        this.ctx.closePath();

        //draw edges
        this.drawEdges(edges);
        //draw nodes
        this.drawNodes(vertices);
    },
    'clear': function(){
        this.ctx.clearRect(0,0,1000,1000);
        this.showGuide();
    }
}

