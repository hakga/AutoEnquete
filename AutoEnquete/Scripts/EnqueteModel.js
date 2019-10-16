var ViewModel = function (json) {
    var self = this;
    this.questions = ko.observableArray([]);
    this.saveAnswers = function (data, e) {
        var saveData = selectMany(data.questions());
        localStorage.setItem('AutoEnquete', JSON.stringify(saveData));
    };
    $.getJSON(json).done(function (data) {
        var rootNodes = makeNodes(data, null);
        remakeNodes(rootNodes, rootNodes);
        self.questions(rootNodes);
        var Answers = localStorage.getItem('AutoEnquete');
        if (Answers) {
            ko.utils.arrayForEach(JSON.parse(Answers), function (i) {
                if (i.data) {
                    var node = findNode(rootNodes, i.code);
                    if (node) node.data(i.data);
                }
            });
        }
    }).fail(function (errs) {
        console.log(errs);
    });
};
function makeNodes(nodes, parent) {
    return nodes.map(function (v) {
        var node = {};
        node.code = v.code;
        node.kind = v.kind;
        node.text = v.text;
        node.items = [];
        node.selected = v.selected;
        node.required = v.required;
        switch (v.kind) {
            case "tab":
                node.items = makeNodes(v.items, node);
                break;
            case "pane":
                node.items = makeNodes(v.items, node);
                break;
            case "radio":
                node.data = ko.observable();
                if (v.items.StandardOptions) {
                    node.items = makeNodes(StandardOptions[v.items.StandardOptions], node);
                } else {
                    node.items = makeNodes(v.items, node);
                }
                break;
            case "option":
                node.checked = parent.data;
                break;
            case "select":
                node.data = ko.observable();
                var items = [];
                if (v.items.StandardOptions) {
                    items = StandardOptions[v.items.StandardOptions];
                } else {
                    items = v.items.filter(function (i) { return i.kind == 'option' });
                }
                node.options = items.map(function (i) {
                    var option = {};
                    option.text = i.text;
                    option.code = i.code;
                    node.rows = i.rows || null;
                    return option;
                });
                break;
            case "text":
                node.data = ko.observable();
                node.cols = v.cols || 20;
                if (v.rows) {
                    node.kind = "textarea";
                    node.rows = v.rows;
                }
                break;
            case "block":
                node.values = [];
                node.items = makeNodes(v.items, node);
                break;
        }
        return node;
    });

}
function remakeNodes(nodes, rootNnodes) {
    nodes.forEach(function (v, i) {
        if (v.selected != null) {
            if (v.selected === true || v.selected === false) {
            } else {
                var c = Object.keys(v.selected);
                if (c[0]) {
                    var node = findNode(rootNnodes, c[0]);
                    if (node != null) {
                        v.selectedValues = v.selected[c[0]];
                        v.selected = ko.computed(function () {
                            return v.selectedValues.includes(node.data());
                        });
                    } else {
                        v.selected = true;
                        console.log("selected参照不良");
                    }
                } else {
                    v.selected = true;
                    console.log("selected参照不正");
                }
            }
        } else v.selected = true;
        if (v.required != null) {
            if (v.required === true || v.required === false) {
            } else {
                var c = Object.keys(v.required);
                if (c[0]) {
                    var node = findNode(rootNnodes, c[0]);
                    if (node != null) {
                        v.requiredValues = v.required[c[0]];
                        v.required = ko.computed(function () {
                            return v.requiredValues.includes(node.data());
                        });
                    } else {
                        v.required = false;
                        console.log("required参照不良");
                    }
                } else {
                    v.required = false;
                    console.log("required参照不正");
                }
            }
        } else v.required = false;
        remakeNodes(v.items, rootNnodes);
    });
}
function findNode(nodes, code) {
    var node = null;
    for ( var i in nodes) {
        if (nodes[i].code == code) {
            node = nodes[i];
            break;
        }
        node = findNode(nodes[i].items, code);
        if ( node != null) break;
    }
    return node;
}
function selectMany(nodes) {
    var lists = [];
    ko.utils.arrayForEach(nodes, function (i) {
        if (i.data) lists.push({ code: i.code, data: i.data() });
        ko.utils.arrayPushAll(lists, selectMany(i.items));
    });
    return lists;
}
window.addEventListener('load', function () {
    // カスタムブートストラップ検証スタイルを適用するすべてのフォームを取得
    var forms = document.getElementsByClassName('needs-validation');
    // ループして帰順を防ぐ
    var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener('submit', function (event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            }
            $('#postModal').modal('toggle');
            form.classList.add('was-validated');
        }, false);
    });
}, false);
