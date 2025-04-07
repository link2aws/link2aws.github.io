var assert = require('assert');
var main = require('../link2aws.js');

var awsTests = require('../testcases/aws.json');
var awsNegativeTests = require('../testcases/aws-negative.json');
var stringTests = require('../testcases/string.json');

describe('main.ARN', function () {
    describe('#constructor(text)', function () {
        it('should reject invalid inputs by throwing', function () {
            assert.throws(() => { new main.ARN('foo') }, Error);
        });

        it('should reject arguments that aren\'t strings', function () {
            assert.throws(() => { new main.ARN(null) }, Error);
            assert.throws(() => { new main.ARN(123) }, Error);
            assert.throws(() => { new main.ARN([]) }, Error);
            assert.throws(() => { new main.ARN({}) }, Error);
        });

        it('should tokenize ARNs without resource-type', function () {
            var arn = new main.ARN('arn:partition:service:region:account-id:resource-id');
            assert.equal(arn.arn, 'arn:partition:service:region:account-id:resource-id');
            assert.equal(arn.prefix, 'arn');
            assert.equal(arn.partition, 'partition');
            assert.equal(arn.service, 'service');
            assert.equal(arn.region, 'region');
            assert.equal(arn.account, 'account-id');
            assert.equal(arn.resource, 'resource-id');
            assert.equal(arn.resource_type, '');
        });

        it('should tokenize ARNs with resource-type/resource-id', function () {
            var arn = new main.ARN('arn:partition:service:region:account-id:resource-type/resource-id');
            assert.equal(arn.arn, 'arn:partition:service:region:account-id:resource-type/resource-id')
            assert.equal(arn.prefix, 'arn');
            assert.equal(arn.partition, 'partition');
            assert.equal(arn.service, 'service');
            assert.equal(arn.region, 'region');
            assert.equal(arn.account, 'account-id');
            assert.equal(arn.resource, 'resource-id');
            assert.equal(arn.resource_type, 'resource-type');
        });

        it('should tokenize ARNs with /resource-type/resource-id', function () {
            var arn = new main.ARN('arn:partition:service:region:account-id:/resource-type/resource-id');
            assert.equal(arn.arn, 'arn:partition:service:region:account-id:/resource-type/resource-id')
            assert.equal(arn.prefix, 'arn');
            assert.equal(arn.partition, 'partition');
            assert.equal(arn.service, 'service');
            assert.equal(arn.region, 'region');
            assert.equal(arn.account, 'account-id');
            assert.equal(arn.resource, 'resource-id');
            assert.equal(arn.resource_type, 'resource-type');
        });

        it('should tokenize ARNs with resource-type:resource-id', function () {
            var arn = new main.ARN('arn:partition:service:region:account-id:resource-type:resource-id');
            assert.equal(arn.arn, 'arn:partition:service:region:account-id:resource-type:resource-id');
            assert.equal(arn.prefix, 'arn');
            assert.equal(arn.partition, 'partition');
            assert.equal(arn.service, 'service');
            assert.equal(arn.region, 'region');
            assert.equal(arn.account, 'account-id');
            assert.equal(arn.resource, 'resource-id');
            assert.equal(arn.resource_type, 'resource-type');
        }); 


        it('should tokenize ARNs with resource-type:resource-id-qualifier-1:qualifier-2:qualifier-3', function () {
            var arn = new main.ARN('arn:partition:service:region:account-id:resource-type:resource-id-qualifier-1:qualifier-2:qualifier-3');
            assert.equal(arn.arn, 'arn:partition:service:region:account-id:resource-type:resource-id-qualifier-1:qualifier-2:qualifier-3');
            assert.equal(arn.prefix, 'arn');
            assert.equal(arn.partition, 'partition');
            assert.equal(arn.service, 'service');
            assert.equal(arn.region, 'region');
            assert.equal(arn.account, 'account-id');
            assert.equal(arn.resource, 'resource-id-qualifier-1:qualifier-2:qualifier-3');
            assert.equal(arn.qualifiers.length, 3);
            assert.equal(arn.qualifiers[0], 'resource-id-qualifier-1');
            assert.equal(arn.qualifiers[1], 'qualifier-2');
            assert.equal(arn.qualifiers[2], 'qualifier-3');
        });
    });

    describe('#string', function() {
        var roundtripTests = [
            'arn:partition:service:region:account-id:resource-id',
            'arn:partition:service:region:account-id:resource-type/resource-id',
            'arn:partition:service:region:account-id:resource-type:resource-id',
        ]
        for (const testcase of roundtripTests) {
            it('should round-trip "arn:partition:service:region:account-id:resource-id"', () => {
                assert.equal(new main.ARN(testcase).string, testcase);
            })
        }
    })

    describe('#consoleLink', function () {
        for (const [testcase, expected] of Object.entries(awsTests)) {
            it(`should generate link for: "${testcase}"`, () => {
                assert.equal(new main.ARN(testcase).consoleLink, expected);
            })
        }
        for (const testcase of awsNegativeTests) {
            it(`should throw for: "${testcase}"`, () => {
                assert.throws(() => { new main.ARN(testcase).consoleLink }, Error);
            })
        }
        for (const [testcase, expected] of Object.entries(stringTests)) {
            it(`should generate link for: "${testcase}"`, () => {
                assert.equal(new main.ARN(testcase).consoleLink, expected);
            })
        }
    });
});