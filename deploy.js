var copydir = require("copy-dir");
var nodejieba = require("nodejieba");
var fs = require("fs");

//中文分词搜索文档
nodejieba.load({
    userDict: './jieba_split_dict.dict.utf8'
});


var pageDic = {};
var searchDictionary = {};
var allDucomentPaths = getAllDocumentPaths();

allDucomentPaths.forEach((path, index) => {
    var documentText = fs.readFileSync(path, "utf8");
    var words = splitWords(documentText)
    var title = documentText.split('\n')[0]
    title = title.replace("# ", "")
    pageDic[index] = [title, path]
    searchDictionary = addWordToDictionary(words, index, searchDictionary)
})

// console.log(JSON.stringify(searchDictionary))

finalStep()

function finalStep() {
    fs.writeFile("./page_dic.json", JSON.stringify(pageDic), function (err) {
        if (err) {
            return console.log(err);
        }
    });

    fs.writeFile("./search.json", JSON.stringify(searchDictionary), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    //把图片移除隐藏文件夹
    if (fs.existsSync("./.gitbook")) {
        copydir.sync("./.gitbook", "./gitbook");
    }

}

// tools
function addWordToDictionary(words, documentPath, dictionary) {
    words.forEach((word) => {
        if (word in dictionary) {
            dictionary[word].push(documentPath)
        } else {
            dictionary[word] = [documentPath]
        }
    })

    return dictionary
}

function getAllDocumentPaths() {
    var menu_markdown = fs.readFileSync("SUMMARY.md", "utf8");
    var lines = menu_markdown.match(/[^\r\n]+/g);
    lines = lines.slice(1)
    var paths = lines.map(function (line) {
        return line.match(/\(([^)]+)\)/)[1]
    })

    return paths
}

function splitWords(documentText) {
    var chineseWords = splitChineseWrods(documentText);

    return arrayToSet(chineseWords)
}

function arrayToSet(array) {
    return array.filter(function (item, pos) {
        return array.indexOf(item) == pos;
    })
}

function splitChineseWrods(documentText) {
    const REGEX_NOT_CHINESE = /[^\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/ug;
    var documentTextWithChineseWrods = documentText.replace(REGEX_NOT_CHINESE, "");//留下中文only
    var result = nodejieba.cut(documentTextWithChineseWrods);
    result = result.filter(function (chars) {
        return chars.length !== 1
    }) //剔除单个中文字
    //    console.table(result);
    return result
}