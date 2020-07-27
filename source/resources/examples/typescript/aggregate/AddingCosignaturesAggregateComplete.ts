// tslint:disable-next-line: max-line-length
import { Account, AggregateTransaction, CosignatureSignedTransaction, CosignatureTransaction, Deadline, Mosaic, NamespaceId, NetworkCurrencyPublic, NetworkType, PlainMessage, PublicAccount, RepositoryFactoryHttp, TransactionMapping, TransferTransaction, UInt64 } from 'symbol-sdk';

/* start block 01 */
const networkType = NetworkType.TEST_NET;

// replace with alice private key
const alicePrivatekey = '';
const aliceAccount =  Account.createFromPrivateKey(alicePrivatekey, networkType);

// replace with bob public key
const bobPublicKey = '';
const bobPublicAccount = PublicAccount.createFromPublicKey(bobPublicKey, networkType);

const aliceTransferTransaction = TransferTransaction.create(
    Deadline.create(),
    bobPublicAccount.address,
    [NetworkCurrencyPublic.createRelative(1000)],
    PlainMessage.create('payout'),
    networkType,
);

const bobTransferTransaction = TransferTransaction.create(
    Deadline.create(),
    aliceAccount.address,
    [new Mosaic(new NamespaceId('collectible'), UInt64.fromHex('1'))],
    PlainMessage.create('payout'),
    networkType,
);

const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(),
    [aliceTransferTransaction.toAggregate(aliceAccount.publicAccount), bobTransferTransaction.toAggregate(bobPublicAccount)],
    networkType,
    [],
    UInt64.fromUint(2000000),
);
/* end block 01 */

/* start block 02 */
// replace with meta.networkGenerationHash (nodeUrl + '/node/info')
const generationHash = '';

const signedTransactionAlice = aliceAccount.sign(aggregateTransaction, generationHash);
console.log(signedTransactionAlice.payload);
/* end block 02 */

/* start block 03 */
// replace with bob private key
const bobPrivateKey = '';
const bobAccount = Account.createFromPrivateKey(bobPrivateKey, networkType);
const cosignedTransactionBob = CosignatureTransaction.signTransactionPayload(bobAccount, signedTransactionAlice.payload, generationHash);
console.log(cosignedTransactionBob.signature);
console.log(cosignedTransactionBob.parentHash);
/* end block 03 */

/* start block 04 */
const cosignatureSignedTransactions = [
    new CosignatureSignedTransaction(
        cosignedTransactionBob.parentHash,
        cosignedTransactionBob.signature,
         cosignedTransactionBob.signerPublicKey),
];
const rectreatedAggregateTransactionFromPayload = TransactionMapping
.createFromPayload(signedTransactionAlice.payload) as AggregateTransaction;

const signedTransaction = aliceAccount
    .signTransactionGivenSignatures(rectreatedAggregateTransactionFromPayload, cosignatureSignedTransactions, generationHash);

// replace with node endpoint
const nodeUrl = 'http://api-01.us-east-1.096x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));
/* end block 04 */
