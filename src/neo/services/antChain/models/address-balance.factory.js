export default AddressBalanceFactory();

function AddressBalanceFactory () {

    function AddressBalance () {
        this.id = undefined;
        this.antShares = undefined;
        this.antCoins = undefined;
    }

    AddressBalance.prototype.update = update;

    function update (rawData) {
        this.id = rawData.address;

        if (rawData.asset && rawData.asset.length === 2) {
            this.antShares = Object.assign({}, rawData.asset[0]);
            this.antCoins = Object.assign({}, rawData.asset[1]);
        }
    }

    function createFromJson (rawData) {
        var inst = new AddressBalance();

        inst.update(rawData);

        return inst;
    }

    return {
        createFromJson: createFromJson
    };
}