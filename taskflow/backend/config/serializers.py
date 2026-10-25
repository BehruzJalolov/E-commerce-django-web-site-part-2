from rest_framework import serializers


class MessageSerializer(serializers.Serializer):
    detail = serializers.CharField()


class HealthSerializer(serializers.Serializer):
    status = serializers.CharField()
    service = serializers.CharField()
    version = serializers.CharField()


class ApiIndexSerializer(serializers.Serializer):
    name = serializers.CharField()
    version = serializers.CharField()
    documentation = serializers.CharField()
    schema = serializers.CharField()
    endpoints = serializers.DictField(child=serializers.CharField())
