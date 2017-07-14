export default AddressAssetFactory();

function AddressAssetFactory () {

    function AddressAsset () {
        this.id = undefined;
        this.name = undefined;
        this.balance = undefined;
        this.transactions = undefined;
    }

    AddressAsset.prototype.update = update;

    function update (rawData) {
        this.id = rawData.assetId;
        this.name = rawData.name;
        this.balance = rawData.balance;

        //List of transactions that contribute to the total balance
        this.transactions = rawData.list.map(function (tx) {
            return Object.assign({}, tx);
        });
    }

    function createFromJson (rawDataList) {

        return rawDataList.map(function (rawData) {
            var inst = new AddressAsset();

            inst.update(rawData);

            return inst;
        });
    }

    return {
        createFromJson: createFromJson
    };
}