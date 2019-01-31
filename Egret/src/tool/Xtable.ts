///<reference path="../Atable/TableFishPath.ts" />
declare module table {
    export module TableFishPath {
        var $instance: { [id: string]: table.TableFishPath };
        function instance(): { [id: string]: table.TableFishPath };
        function getFishPath(id: string): table.TableFishPath;
    }
}
table.TableFishPath.instance = function (): { [id: string]: table.TableFishPath } {
    if (table.TableFishPath.$instance == null) {
        let scale = uniLib.Global.screenWidth / 1280;
        let fishPath: table.TableFishPath[] = ArrayUtil.deepcopy(loadTable("TableFishPath_json"));
        let instance = {};
        for (let item of fishPath) {
            instance[item.id] = item;
            for(let point of item.pathConfig){
                point.x *= scale;
            }
        }
        table.TableFishPath.$instance = instance;
    }
    return table.TableFishPath.$instance;
}

table.TableFishPath.getFishPath = function (id: string): table.TableFishPath {
    return table.TableFishPath.instance()[id];
}

declare module table {
    export module TableFishConfig {
        var $instance: table.TableFishConfig[];
        function instance(): table.TableFishConfig[];
    }

    export module TableBatteryConfig {
        var $instance: table.TableBatteryConfig[];
        function instance(): table.TableBatteryConfig[];
    }


    export module TableBulletConfig {
        var $instance: table.TableBulletConfig[];
        function instance(): table.TableBulletConfig[];
    }

}

table.TableBulletConfig.instance = function (): table.TableBulletConfig[] {
    if (table.TableBulletConfig.$instance == null) {
        table.TableBulletConfig.$instance = loadTable("TableBulletConfig_json");
    }
    return table.TableBulletConfig.$instance;
}

table.TableFishConfig.instance = function (): table.TableFishConfig[] {
    if (table.TableFishConfig.$instance == null) {
        table.TableFishConfig.$instance = loadTable("TableFishConfig_json");
    }
    return table.TableFishConfig.$instance;
}

table.TableBatteryConfig.instance = function (): table.TableBatteryConfig[] {
    if (table.TableBatteryConfig.$instance == null) {
        table.TableBatteryConfig.$instance = loadTable("TableBatteryConfig_json");
    }
    return table.TableBatteryConfig.$instance;
}