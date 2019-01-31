
// 对自动生成的表格代码的扩展

// TableFishPath
declare module table {
    export module TableFishPath {
        var $instance: table.TableFishPath[];
        function instance(): table.TableFishPath[];
    }
}

table.TableFishPath.instance = function (): table.TableFishPath[] {
    if (table.TableFishPath.$instance == null) {
        table.TableFishPath.$instance = RES.getRes("TableFishPath_json");
    }
    return table.TableFishPath.$instance;
}

declare module table {
    export module TableFishConfig {
        var $instance: table.TableFishConfig[];
        function instance(): table.TableFishConfig[];
    }
}

table.TableFishConfig.instance = function (): table.TableFishConfig[] {
    if (table.TableFishConfig.$instance == null) {
        table.TableFishConfig.$instance = RES.getRes("TableFishConfig_json");
    }
    return table.TableFishConfig.$instance;
}