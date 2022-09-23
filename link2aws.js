// https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
// https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/resource-ids.html
class ARN {
    constructor(text) {
        text = text.trim();

        // split into tokens; leaving resource-id with colons together
        var firstTokens = text.split(':');
        var tokens = firstTokens.splice(0, 6);
        if (firstTokens.length > 0) {
            tokens.push(firstTokens.join(':'));
        }

        // arn:partition:service:region:account-id:...
        this.prefix = tokens[0];
        this.partition = tokens[1];
        this.service = tokens[2];
        this.region = tokens[3];
        this.account = tokens[4];

        // ...:resource-type:resource-id (resource-id can contain colons!)
        if (typeof (tokens[6]) != 'undefined') {
            this.resource_type = tokens[5];
            this.resource = tokens[6];
            this.hasPath = false;
        }

        // ...:resource-type/resource-id (resource-id can contain slashes!)
        else if (typeof (tokens[5]) != 'undefined' && tokens[5].indexOf('/') > 0) {
            this.resource_type = tokens[5].slice(0, tokens[5].indexOf('/'));
            this.resource = tokens[5].slice(tokens[5].indexOf('/') + 1, tokens[5].length);
            this.hasPath = true;
        }

        // ...:resource-id
        else if (typeof (tokens[5]) != 'undefined') {
            this.resource_type = '';
            this.resource = tokens[5];
            this.hasPath = false;
        }

        // anything else
        else {
            throw Error("Bad number of tokens");
        }

        this._linkTemplates = this._getLinkTemplates();
    }

    get string() {
        if (!this.resource_type) {
            return `${this.prefix}:${this.partition}:${this.service}:${this.region}:${this.account}:${this.resource}`;
        } else if (this.hasPath) {
            return `${this.prefix}:${this.partition}:${this.service}:${this.region}:${this.account}:${this.resource_type}/${this.resource}`
        } else {
            return `${this.prefix}:${this.partition}:${this.service}:${this.region}:${this.account}:${this.resource_type}:${this.resource}`
        }
    }

    get console() {
        switch (this.partition) {
            case "aws":
                return `console.aws.amazon.com`;
            case "aws-us-gov":
                return `console.amazonaws-us-gov.com`; // untested
            case "aws-cn":
                return `console.amazonaws.cn`; // untested
            default:
                throw Error(`Bad/unsupported AWS partition: ${this.partition}`);
        }
    }

    get qualifiers() {        
        return this.resource.split(':');        
    }

    get pathAllButLast() {
        // Example: "aws-service-role/support.amazonaws.com/AWSServiceRoleForSupport" -> "aws-service-role/support.amazonaws.com"
        return this.resource.substr(0, this.resource.lastIndexOf('/'));
    }

    get pathLast() {
        // Example: "aws-service-role/support.amazonaws.com/AWSServiceRoleForSupport" -> "AWSServiceRoleForSupport"
        return this.resource.substr(this.resource.lastIndexOf('/') + 1, this.resource.length);
    }

    get consoleLink() {
        if (this.prefix != "arn") {
            throw Error(`Bad ARN prefix ${this.prefix}`)
        }

        var serviceConsoleLinkTemplates = this._linkTemplates[this.service];
        if (typeof (serviceConsoleLinkTemplates) === 'undefined') {
            throw Error(`AWS service ${this.service} unknown`);
        }

        var template = serviceConsoleLinkTemplates[this.resource_type];
        if (typeof (template) === 'undefined' || !template) {
            throw Error(`AWS service ${this.service} resource type ${this.resource_type} not supported`);
        }

        return template(this);
    }

    _getLinkTemplates() {
        return {
            "a4b": { // Alexa for Business
                "address-book": null,
                "conference-provider": null,
                "contact": null,
                "device": null,
                "network-profile": null,
                "profile": null,
                "room": null,
                "schedule": null,
                "skill-group": null,
                "user": null,
            },
            "access-analyzer": { // IAM Access Analyzer
                "analyzer": () => `https://${this.region}.${this.console}/access-analyzer/home?region=${this.region}#/analyzer/${this.resource}`,
            },
            "acm": { // AWS Certificate Manager
                "certificate": () => `https://${this.console}/acm/home?region=${this.region}#/?id=${this.resource}`,
            },
            "acm-pca": { // AWS Certificate Manager Private Certificate Authority
                "certificate-authority": null,
            },
            "amplify": { // AWS Amplify
                "apps": null,
            },
            "apigateway": { // Manage Amazon API Gateway
                "": null,
            },
            "appconfig": { // AWS AppConfig
                "application": null,
                "deploymentstrategy": null,
            },
            "appflow": { // Amazon AppFlow
                "connectorprofile": null,
                "flow": null,
            },
            "appmesh": { // AWS App Mesh
                "mesh": null,
            },
            "appmesh-preview": { // AWS App Mesh Preview
                "mesh": null,
            },
            "appstream": { // Amazon AppStream 2.0
                "fleet": null,
                "image": null,
                "image-builder": null,
                "stack": null,
            },
            "appsync": { // AWS AppSync
                "apis": null,
            },
            "artifact": { // AWS Artifact
                "agreement": null,
                "customer-agreement": null,
                "report-package": null,
            },
            "athena": { // Amazon Athena
                "datacatalog": null,
                "workgroup": null,
            },
            "autoscaling": { // Amazon EC2 Auto Scaling
                "autoScalingGroup": null,
                "launchConfiguration": null,
            },
            "aws-marketplace": { // AWS Marketplace Catalog
            },
            "backup": { // AWS Backup
                "backup-plan": null,
                "backup-vault": null,
            },
            "batch": { // AWS Batch
                "job-definition": null,
                "job-queue": null,
            },
            "budgets": { // AWS Budget Service
                "budget": null,
            },
            "cassandra": { // Amazon Keyspaces (for Apache Cassandra)
                "": null,
            },
            "catalog": { // AWS Service Catalog
                "portfolio": null,
                "product": null,
            },
            "chatbot": { // AWS Chatbot
            },
            "chime": { // Amazon Chime
                "meeting": null,
            },
            "cloud9": { // AWS Cloud9
                "environment": null,
            },
            "clouddirectory": { // Amazon Cloud Directory
                "directory": null,
                "schema": null,
            },
            "cloudformation": { // AWS CloudFormation
                "changeSet": null,
                "stack": null,
                "stackset": null,
            },
            "cloudfront": { // Amazon CloudFront
                "distribution": null,
                "origin-access-identity": null,
                "streaming-distribution": null,
            },
            "cloudhsm": { // AWS CloudHSM
                "backup": null,
                "cluster": null,
            },
            "cloudsearch": { // Amazon CloudSearch
                "domain": null,
            },
            "cloudtrail": { // AWS CloudTrail
                "trail": null,
            },
            "cloudwatch": { // Amazon CloudWatch
                "alarm": null,
                "dashboard": null,
                "insight-rule": null,
            },
            "codeartifact": { // AWS CodeArtifact
                "domain": null,
                "package": null,
                "repository": null,
            },
            "codebuild": { // AWS CodeBuild
                "build": null,
                "project": null,
                "report": null,
                "report-group": null,
            },
            "codecommit": { // Amazon CodeGuru Reviewer
            },
            "codedeploy": { // AWS CodeDeploy
                "application": null,
                "deploymentconfig": null,
                "deploymentgroup": null,
                "instance": null,
            },
            "codeguru-profiler": { // Amazon CodeGuru Profiler
                "profilingGroup": null,
            },
            "codeguru-reviewer": { // Amazon CodeGuru Reviewer
                ".+": null,
                "association": null,
            },
            "codepipeline": { // AWS CodePipeline
                "actiontype": null,
                "webhook": null,
            },
            "codestar": { // AWS CodeStar
                "project": null,
            },
            "codestar-connections": { // AWS CodeStar Connections
                "connection": null,
            },
            "codestar-notifications": { // AWS CodeStar Notifications
                "notificationrule": null,
            },
            "cognito-identity": { // Amazon Cognito Identity
                "identitypool": null,
            },
            "cognito-idp": { // Amazon Cognito User Pools
                "userpool": null,
            },
            "cognito-sync": { // Amazon Cognito Sync
                "identitypool": null,
            },
            "comprehend": { // Amazon Comprehend
                "document-classifier": null,
                "document-classifier-endpoint": null,
                "entity-recognizer": null,
            },
            "config": { // AWS Config
                "aggregation-authorization": null,
                "config-aggregator": null,
                "config-rule": null,
                "conformance-pack": null,
                "organization-config-rule": null,
                "organization-conformance-pack": null,
                "remediation-configuration": null,
            },
            "connect": { // Amazon Connect
                "instance": null,
            },
            "cur": { // AWS Cost and Usage Report
                "definition": null,
            },
            "dataexchange": { // AWS Data Exchange
                "data-sets": null,
                "jobs": null,
            },
            "datasync": { // DataSync
                "agent": null,
                "location": null,
                "task": null,
            },
            "dax": { // Amazon DynamoDB Accelerator (DAX)
                "cache": null,
            },
            "deepcomposer": { // AWS DeepComposer
                "audio": null,
                "composition": null,
                "model": null,
            },
            "deeplens": { // AWS DeepLens
                "device": null,
                "model": null,
                "project": null,
            },
            "deepracer": { // AWS DeepRacer
                " evaluation_job": null,
                "leaderboard": null,
                "leaderboard_evaluation_job": null,
                "model": null,
                "track": null,
                "training_job": null,
            },
            "detective": { // Amazon Detective
                "graph": null,
            },
            "devicefarm": { // AWS Device Farm
                "artifact": null,
                "device": null,
                "deviceinstance": null,
                "devicepool": null,
                "instanceprofile": null,
                "job": null,
                "networkprofile": null,
                "project": null,
                "run": null,
                "sample": null,
                "session": null,
                "suite": null,
                "test": null,
                "testgrid-project": null,
                "testgrid-session": null,
                "upload": null,
                "vpceconfiguration": null,
            },
            "directconnect": { // AWS Direct Connect
                "dx-gateway": null,
                "dxcon": null,
                "dxlag": null,
                "dxvif": null,
            },
            "dlm": { // Amazon Data Lifecycle Manager
                "policy": null,
            },
            "dms": { // AWS Database Migration Service
                "cert": null,
                "endpoint": null,
                "es": null,
                "rep": null,
                "subgrp": null,
                "task": null,
            },
            "ds": { // AWS Directory Service
                "directory": null,
            },
            "dynamodb": { // Amazon DynamoDB
                "global-table": null,
                "table": () => `https://${this.region}.${this.console}/dynamodbv2/home?region=${this.region}#table?name=${this.resource}`,
            },
            "ec2": { // AWS Systems Manager
                "capacity-reservation": null,
                "client-vpn-endpoint": null,
                "customer-gateway": null,
                "dedicated-host": null,
                "dhcp-options": null,
                "elastic-gpu": null,
                "fpga-image": null,
                "image": null,
                "instance": () => `https://${this.region}.${this.console}/ec2/v2/home`,
                "internet-gateway": null,
                "key-pair": null,
                "launch-template": null,
                "local-gateway": null,
                "local-gateway-route-table": null,
                "local-gateway-route-table-virtual-interface-group-association": null,
                "local-gateway-route-table-vpc-association": null,
                "local-gateway-virtual-interface": null,
                "local-gateway-virtual-interface-group": null,
                "network-acl": null,
                "network-interface": null,
                "placement-group": null,
                "reserved-instances": null,
                "route-table": null,
                "security-group": () => `https://${this.region}.${this.console}/vpc/home?region=${this.region}#SecurityGroup:groupId=${this.resource}`,
                "snapshot": null,
                "spot-instances-request": null,
                "subnet": () => `https://${this.region}.${this.console}/vpc/home?region=${this.region}#SubnetDetails:subnetId=${this.resource}`,
                "traffic-mirror-filter": null,
                "traffic-mirror-filter-rule": null,
                "traffic-mirror-session": null,
                "traffic-mirror-target": null,
                "transit-gateway": null,
                "transit-gateway-attachment": null,
                "transit-gateway-multicast-domain": null,
                "transit-gateway-route-table": null,
                "volume": null,
                "vpc": () => `https://${this.region}.${this.console}.aws.amazon.com/vpc/home?region=${this.region}#VpcDetails:VpcId=${this.resource}`,
                "vpc-endpoint": null,
                "vpc-endpoint-service": null,
                "vpc-flow-log": null,
                "vpc-peering-connection": null,
                "vpn-connection": null,
                "vpn-gateway": null,
            },
            "ecr": { // Amazon Elastic Container Registry
                "repository": null,
            },
            "ecs": { // Amazon Elastic Container Service
                "cluster": () => `https://${this.region}.${this.console}/ecs/home?region=${this.region}#/clusters/${this.resource}`,
                "container-instance": null,
                "service": null,
                "task": () => `https://${this.region}.${this.console}/ecs/home?region=${this.region}#/clusters/${this.pathAllButLast}/tasks/${this.pathLast}`,
                "task-definition": null,
                "task-set": null,
            },
            "eks": { // Amazon Elastic Container Service for Kubernetes
                "cluster": null,
                "fargateprofile": null,
                "nodegroup": null,
            },
            "elastic-inference": { // Amazon Elastic Inference
                "elastic-inference-accelerator": null,
            },
            "elasticbeanstalk": { // AWS Elastic Beanstalk
                "application": null,
                "applicationversion": null,
                "configurationtemplate": null,
                "environment": null,
                "platform": null,
                "solutionstack": null,
            },
            "elasticfilesystem": { // Amazon Elastic File System
                "access-point": null,
                "file-system": null,
            },
            "elasticloadbalancing": { // AWS WAF V2
                "listener": null,
                "listener-rule": null,
                "loadbalancer": null,
                "targetgroup": null,
            },
            "elasticmapreduce": { // Amazon Elastic MapReduce
                "cluster": null,
                "editor": null,
            },
            "elastictranscoder": { // Amazon Elastic Transcoder
                "job": null,
                "pipeline": null,
                "preset": null,
            },
            "es": { // Amazon Elasticsearch Service
                "domain": null,
            },
            "events": { // Amazon EventBridge
                "event-bus": null,
                "event-source": null,
                "rule": null,
            },
            "execute-api": { // Amazon API Gateway
            },
            "firehose": { // Amazon Kinesis Firehose
                "deliverystream": null,
            },
            "fms": { // AWS Firewall Manager
                "policy": null,
            },
            "forecast": { // Amazon Forecast
                "algorithm": null,
                "dataset": null,
                "dataset-group": null,
                "dataset-import-job": null,
                "forecast": null,
                "forecast-export-job": null,
                "predictor": null,
            },
            "freertos": { // Amazon FreeRTOS
                "configuration": null,
            },
            "fsx": { // Amazon FSx
                "backup": null,
                "file-system": null,
                "task": null,
            },
            "gamelift": { // Amazon GameLift
                "alias": null,
                "build": null,
                "fleet": null,
                "gamesessionqueue": null,
                "matchmakingconfiguration": null,
                "matchmakingruleset": null,
                "script": null,
            },
            "glacier": { // Amazon Glacier
                "vaults": null,
            },
            "globalaccelerator": { // AWS Global Accelerator
                "accelerator": null,
            },
            "glue": { // AWS Glue
                "catalog": null,
                "connection": null,
                "crawler": null,
                "database": null,
                "devendpoint": null,
                "job": null,
                "mlTransform": null,
                "table": null,
                "tableVersion": null,
                "trigger": null,
                "userDefinedFunction": null,
                "workflow": null,
            },
            "greengrass": { // AWS IoT Greengrass
                "": null,
            },
            "groundstation": { // AWS Ground Station
                "config": null,
                "contact": null,
                "dataflow-endpoint-group": null,
                "groundstation": null,
                "mission-profile": null,
                "satellite": null,
            },
            "guardduty": { // Amazon GuardDuty
                "detector": null,
            },
            "health": { // AWS Health APIs and Notifications
                "event": null,
            },
            "honeycode": { // Amazon Honeycode
                "screen": null,
                "screen-automation": null,
            },
            "iam": { // AWS Security Token Service
                "access-report": null,
                "assumed-role": null,
                "federated-user": null,
                "group": () => `https://${this.console}/iamv2/home#/groups/details/${this.pathLast}`,
                "instance-profile": null,
                "mfa": null,
                "oidc-provider": () => `https://${this.console}/iam/home?#/providers/${this.string}`,
                "policy": () => `https://${this.console}/iam/home?#/policies/${this.string}`,
                "role": () => `https://${this.console}/iam/home?#/roles/${this.pathLast}`,
                "saml-provider": null,
                "server-certificate": null,
                "sms-mfa": null,
                "user": () => `https://${this.console}/iam/home?#/users/${this.resource}`,
            },
            "imagebuilder": { // Amazon EC2 Image Builder
                "component": null,
                "distribution-configuration": null,
                "image": null,
                "image-pipeline": null,
                "image-recipe": null,
                "infrastructure-configuration": null,
            },
            "iot": { // AWS IoT
                "authorizer": null,
                "billinggroup": null,
                "cacert": null,
                "cert": null,
                "client": null,
                "dimension": null,
                "index": null,
                "job": null,
                "mitigationaction": null,
                "otaupdate": null,
                "policy": null,
                "provisioningtemplate": null,
                "rolealias": null,
                "rule": null,
                "scheduledaudit": null,
                "securityprofile": null,
                "stream": null,
                "thing": null,
                "thinggroup": null,
                "thingtype": null,
                "topic": null,
                "topicfilter": null,
                "tunnel": null,
            },
            "iot1click": { // AWS IoT 1-Click
                "devices": null,
                "projects": null,
            },
            "iotanalytics": { // AWS IoT Analytics
                "channel": null,
                "dataset": null,
                "datastore": null,
                "pipeline": null,
            },
            "iotevents": { // AWS IoT Events
                "detectorModel": null,
                "input": null,
            },
            "iotsitewise": { // AWS IoT SiteWise
                "access-policy": null,
                "asset": null,
                "asset-model": null,
                "dashboard": null,
                "gateway": null,
                "portal": null,
                "project": null,
            },
            "iotthingsgraph": { // AWS IoT Things Graph
                "Deployment": null,
                "System": null,
                "Workflow": null,
            },
            "kafka": { // Amazon Managed Streaming for Kafka
                "cluster": null,
            },
            "kendra": { // Amazon Kendra
                "index": null,
            },
            "kinesis": { // Amazon Kinesis
                "stream": null,
            },
            "kinesisanalytics": { // Amazon Kinesis Analytics V2
                "application": null,
            },
            "kinesisvideo": { // Amazon Kinesis Video Streams
                "channel": null,
                "stream": null,
            },
            "kms": { // AWS Key Management Service
                "alias": null,
                "key": null,
            },
            "lambda": { // AWS Lambda
                "event-source-mapping": null,
                "function": () => `https://${this.region}.${this.console}/lambda/home?region=${this.region}#/functions/${this.resource}`,
                "layer": () => `https://${this.region}.${this.console}/lambda/home?region=${this.region}#/layers/${this.qualifiers[0]}/versions/${this.qualifiers[1] || 1}`,
            },
            "lex": { // Amazon Lex
                "bot": null,
                "bot-channel": null,
                "intent": null,
                "slottype": null,
            },
            "license-manager": { // AWS License Manager
                "license-configuration": null,
            },
            "lightsail": { // Amazon Lightsail
                "CloudFormationStackRecord": null,
                "Disk": null,
                "DiskSnapshot": null,
                "Domain": null,
                "ExportSnapshotRecord": null,
                "Instance": null,
                "InstanceSnapshot": null,
                "KeyPair": null,
                "LoadBalancer": null,
                "LoadBalancerTlsCertificate": null,
                "PeeredVpc": null,
                "RelationalDatabase": null,
                "RelationalDatabaseSnapshot": null,
                "StaticIp": null,
            },
            "logs": { // Amazon CloudWatch Logs
                "log-group": () => `https://${this.region}.${this.console}/cloudwatch/home?region=${this.region}#logsV2:log-groups/log-group/${this.resource.replace(/:\*$/, "").replace(/#/g, "$2523").replace(/[/]/g, "$252F")}`,
            },
            "machinelearning": { // Amazon Machine Learning
                "batchprediction": null,
                "datasource": null,
                "evaluation": null,
                "mlmodel": null,
            },
            "macie2": { // Amazon Macie
                "classification-job": null,
                "custom-data-identifier": null,
                "findings-filter": null,
                "member": null,
            },
            "managedblockchain": { // Amazon Managed Blockchain
                "invitations": null,
                "members": null,
                "networks": null,
                "nodes": null,
                "proposals": null,
            },
            "mediaconnect": { // AWS Elemental MediaConnect
                "entitlement": null,
                "flow": null,
                "output": null,
                "source": null,
            },
            "mediaconvert": { // AWS Elemental MediaConvert
                "certificates": null,
                "jobTemplates": null,
                "jobs": null,
                "presets": null,
                "queues": null,
            },
            "medialive": { // AWS Elemental MediaLive
                "channel": null,
                "input": null,
                "inputDevice": null,
                "inputSecurityGroup": null,
                "multiplex": null,
                "offering": null,
                "reservation": null,
            },
            "mediapackage": { // AWS Elemental MediaPackage
                "channels": null,
                "origin_endpoints": null,
            },
            "mediapackage-vod": { // AWS Elemental MediaPackage VOD
                "assets": null,
                "packaging-configurations": null,
                "packaging-groups": null,
            },
            "mediastore": { // AWS Elemental MediaStore
                "container": null,
            },
            "mediatailor": { // AWS Elemental MediaTailor
                "playbackConfiguration": null,
            },
            "mgh": { // AWS Migration Hub
                "progressUpdateStream": null,
            },
            "mobilehub": { // AWS Mobile Hub
                "project": null,
            },
            "mobiletargeting": { // Amazon Pinpoint
                "apps": null,
                "recommenders": null,
                "templates": null,
            },
            "mq": { // Amazon MQ
                "broker": null,
                "configuration": null,
            },
            "neptune-db": { // Amazon Neptune
            },
            "networkmanager": { // Network Manager
                "device": null,
                "global-network": null,
                "link": null,
                "site": null,
            },
            "opsworks": { // AWS OpsWorks
                "stack": null,
            },
            "organizations": { // AWS Organizations
                "account": null,
                "handshake": null,
                "organization": null,
                "ou": null,
                "policy": null,
                "root": null,
            },
            "outposts": { // AWS Outposts
                "order": null,
                "outpost": null,
                "site": null,
            },
            "personalize": { // Amazon Personalize
                "algorithm": null,
                "campaign": null,
                "dataset": null,
                "dataset-group": null,
                "dataset-import-job": null,
                "event-tracker": null,
                "feature-transformation": null,
                "recipe": null,
                "schema": null,
                "solution": null,
            },
            "pi": { // AWS Performance Insights
                "metrics": null,
            },
            "polly": { // Amazon Polly
                "lexicon": null,
            },
            "qldb": { // Amazon QLDB
                "ledger": null,
                "stream": null,
            },
            "quicksight": { // Amazon QuickSight
                "assignment": null,
                "dashboard": null,
                "group": null,
                "template": null,
                "user": null,
            },
            "ram": { // AWS Resource Access Manager
                "permission": null,
                "resource-share": null,
                "resource-share-invitation": null,
            },
            "rds": { // Amazon RDS
                "cluster": null,
                "cluster-endpoint": null,
                "cluster-pg": null,
                "cluster-snapshot": null,
                "db": null,
                "db-proxy": null,
                "es": null,
                "og": null,
                "pg": null,
                "ri": null,
                "secgrp": null,
                "snapshot": null,
                "subgrp": null,
                "target": null,
                "target-group": null,
            },
            "rds-db": { // Amazon RDS IAM Authentication
                "dbuser": null,
            },
            "redshift": { // Amazon Redshift
                "cluster": null,
                "dbgroup": null,
                "dbname": null,
                "dbuser": null,
                "eventsubscription": null,
                "hsmclientcertificate": null,
                "hsmconfiguration": null,
                "parametergroup": null,
                "securitygroup": null,
                "securitygroupingress": null,
                "snapshot": null,
                "snapshotcopygrant": null,
                "snapshotschedule": null,
                "subnetgroup": null,
            },
            "rekognition": { // Amazon Rekognition
                "collection": null,
                "project": null,
                "streamprocessor": null,
            },
            "resource-groups": { // AWS Resource Groups
                "group": null,
            },
            "robomaker": { // AWS RoboMaker
                "deployment-fleet": null,
                "deployment-job": null,
                "robot": null,
                "robot-application": null,
                "simulation-application": null,
                "simulation-job": null,
                "simulation-job-batch": null,
            },
            "route53": { // Amazon Route 53
                "change": null,
                "delegationset": null,
                "healthcheck": () => `https://${this.console}/route53/healthchecks/home`,
                "hostedzone": () => `https://${this.console}/route53/home?#resource-record-sets:${this.resource}`,
                "queryloggingconfig": null,
                "trafficpolicy": () => `https://${this.console}/route53/trafficflow/home#/policy/${this.resource}`,
                "trafficpolicyinstance": () => `https://${this.console}/route53/trafficflow/home#/modify-records/edit/${this.resource}`,
            },
            "route53resolver": { // Amazon Route 53 Resolver
                "resolver-endpoint": null,
                "resolver-rule": null,
            },
            "s3": { // Amazon S3
                "": () => `https://s3.${this.console}/s3/buckets/${this.resource}`,
                "accesspoint": null,
                "job": null,
            },
            "sagemaker": { // Amazon SageMaker
                "algorithm": null,
                "app": null,
                "automl-job": null,
                "code-repository": null,
                "compilation-job": null,
                "domain": null,
                "endpoint": null,
                "endpoint-config": null,
                "experiment": null,
                "experiment-trial": null,
                "experiment-trial-component": null,
                "flow-definition": null,
                "human-loop": null,
                "human-task-ui": null,
                "hyper-parameter-tuning-job": null,
                "labeling-job": null,
                "model": null,
                "model-package": null,
                "monitoring-schedule": null,
                "notebook-instance": null,
                "notebook-instance-lifecycle-config": null,
                "processing-job": null,
                "training-job": null,
                "transform-job": null,
                "user-profile": null,
                "workforce": null,
                "workteam": null,
            },
            "savingsplans": { // AWS Savings Plans
                "savingsplan": null,
            },
            "schemas": { // Amazon EventBridge Schemas
                "discoverer": null,
                "registry": null,
                "schema": null,
            },
            "sdb": { // Amazon SimpleDB
                "domain": null,
            },
            "secretsmanager": { // AWS Secrets Manager
                "secret": null,
            },
            "securityhub": { // AWS Security Hub
                "hub": null,
                "product": null,
            },
            "serverlessrepo": { // AWS Serverless Application Repository
                "applications": null,
            },
            "servicediscovery": { // AWS Cloud Map
                "namespace": null,
                "service": null,
            },
            "servicequotas": { // Service Quotas
            },
            "ses": { // Amazon SES
                "configuration-set": null,
                "custom-verification-email-template": null,
                "dedicated-ip-pool": null,
                "deliverability-test-report": null,
                "identity": null,
                "receipt-filter": null,
                "receipt-rule-set": null,
                "template": null,
            },
            "shield": { // AWS Shield
                "attack": null,
                "protection": null,
            },
            "signer": { // AWS Code Signing for Amazon FreeRTOS
                "": null,
            },
            "sns": { // Amazon SNS
            },
            "sqs": { // Amazon SQS
                "": () => `https://${this.region}.${this.console}/sqs/v2/home?region=${this.region}#/queues/https%3A%2F%2Fsqs.${this.region}.amazonaws.com%2F${this.account}%2F${this.resource}`
            },
            "ssm": { // AWS Systems Manager
                "association": null,
                "automation-definition": null,
                "automation-execution": null,
                "document": null,
                "maintenancewindow": null,
                "managed-instance": null,
                "managed-instance-inventory": null,
                "opsitem": null,
                "parameter": null,
                "patchbaseline": null,
                "resource-data-sync": null,
                "servicesetting": null,
                "session": null,
                "windowtarget": null,
                "windowtask": null,
            },
            "states": { // AWS Step Functions
                "activity": null,
                "execution": null,
                "stateMachine": () => `https://${this.region}.${this.console}/states/home?region=${this.region}#/statemachines/view/${this.string}`,
            },
            "storagegateway": { // Amazon Storage Gateway
                "gateway": null,
                "share": null,
                "tape": null,
            },
            "sumerian": { // Amazon Sumerian
                "project": null,
            },
            "swf": { // Amazon Simple Workflow Service
                "domain": null,
            },
            "synthetics": { // Amazon CloudWatch Synthetics
                "canary": null,
            },
            "transfer": { // AWS Transfer for SFTP
                "server": null,
                "user": null,
            },
            "trustedadvisor": { // AWS Trusted Advisor
                "checks": null,
            },
            "waf": { // AWS WAF
                "bytematchset": null,
                "geomatchset": null,
                "ipset": null,
                "ratebasedrule": null,
                "regexmatch": null,
                "regexpatternset": null,
                "rule": null,
                "rulegroup": null,
                "sizeconstraintset": null,
                "sqlinjectionset": null,
                "webacl": null,
                "xssmatchset": null,
            },
            "waf-regional": { // AWS WAF Regional
                "bytematchset": null,
                "geomatchset": null,
                "ipset": null,
                "ratebasedrule": null,
                "regexmatch": null,
                "regexpatternset": null,
                "rule": null,
                "rulegroup": null,
                "sizeconstraintset": null,
                "sqlinjectionset": null,
                "webacl": null,
                "xssmatchset": null,
            },
            "wafv2": { // AWS WAF V2
            },
            "wellarchitected": { // AWS Well-Architected Tool
                "workload": null,
            },
            "worklink": { // Amazon WorkLink
                "fleet": null,
            },
            "workmail": { // Amazon WorkMail
                "organization": null,
            },
            "workmailmessageflow": { // Amazon WorkMail Message Flow
                "message": null,
            },
            "workspaces": { // Amazon WorkSpaces
                "directory": null,
                "workspace": null,
                "workspacebundle": null,
                "workspaceipgroup": null,
            },
            "xray": { // AWS X-Ray
                "group": null,
                "sampling-rule": null,
            },
        }
    }
}

// Running as command line script? (not in browser, and not as library)
/* istanbul ignore if */
if (typeof (require) !== 'undefined' && require.main === module) {
    for (let i = 2; i < process.argv.length; i++) {
        try {
            console.log(new ARN(process.argv[i]).consoleLink);
        } catch (e) {
            console.error(e);
        }
    }
}

exports.ARN = ARN;