from rest_framework import serializers

from tasks.serializers import TaskSerializer


class DashboardStatsSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    todo_tasks = serializers.IntegerField()
    in_progress_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    completion_percentage = serializers.IntegerField()
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()


class BreakdownSerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()
    count = serializers.IntegerField()


class WeeklyActivitySerializer(serializers.Serializer):
    date = serializers.DateField()
    label = serializers.CharField()
    created = serializers.IntegerField()
    completed = serializers.IntegerField()


class ProjectOverviewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    color = serializers.CharField()
    task_count = serializers.IntegerField()
    completed_task_count = serializers.IntegerField()
    completion_percentage = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    stats = DashboardStatsSerializer()
    status_breakdown = BreakdownSerializer(many=True)
    priority_breakdown = BreakdownSerializer(many=True)
    weekly_activity = WeeklyActivitySerializer(many=True)
    recent_tasks = TaskSerializer(many=True)
    upcoming_tasks = TaskSerializer(many=True)
    projects = ProjectOverviewSerializer(many=True)
