export default NeonTransforms();

function NeonTransforms () {

    function transformGetBlockHeight (result) {
        return {
            height: result.block_height
        };
    }

    return [
        { sig: 'GET::block/height', transform: transformGetBlockHeight }
    ];

}

