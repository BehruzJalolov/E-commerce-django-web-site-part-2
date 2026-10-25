from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from projects.models import Project
from tasks.models import Task

User = get_user_model()


PROJECTS = [
    {
        "name": "Website refresh",
        "description": (
            "Rebuild the marketing site with a sharper story, faster pages "
            "and a consistent design system."
        ),
        "color": "#6366f1",
        "is_archived": False,
    },
    {
        "name": "Mobile app v2",
        "description": (
            "Ship the next release of the TaskFlow mobile companion: "
            "offline drafts, faster sync and a calmer home screen."
        ),
        "color": "#0ea5e9",
        "is_archived": False,
    },
    {
        "name": "Q4 launch",
        "description": (
            "Coordinate the launch plan across product, marketing and "
            "customer success."
        ),
        "color": "#f59e0b",
        "is_archived": False,
    },
    {
        "name": "Legacy migration",
        "description": (
            "Archived workspace kept for reference while old tasks are retired."
        ),
        "color": "#64748b",
        "is_archived": True,
    },
]

TASKS = [
    ("Website refresh", "Finalize homepage copy", "Tighten the headline and remove jargon from the first screen.", "in_progress", "high", 2, 0),
    ("Website refresh", "Build responsive pricing table", "Pricing should collapse cleanly on small screens and keep the comparison scannable.", "todo", "medium", 5, 1),
    ("Website refresh", "Audit colour contrast", "Check every interactive element against WCAG AA contrast ratios.", "todo", "low", -2, 2),
    ("Website refresh", "QA the new navigation", "Test keyboard navigation, focus states and the mobile drawer.", "done", "medium", -1, 3),
    ("Mobile app v2", "Offline draft storage", "Queue task edits locally and reconcile them after the next successful sync.", "in_progress", "urgent", 1, 0),
    ("Mobile app v2", "Sync conflict resolution", "Design a clear, non-destructive resolution path for concurrent edits.", "todo", "high", 4, 2),
    ("Mobile app v2", "Profile screen polish", "Align spacing and empty states with the refreshed design system.", "done", "low", -4, 5),
    ("Mobile app v2", "Instrument onboarding events", "Track step completion without collecting unnecessary personal data.", "todo", "medium", 7, 3),
    ("Q4 launch", "Draft launch announcement", "Write the product story, customer quote and short changelog summary.", "in_progress", "high", 3, 1),
    ("Q4 launch", "Prepare support macros", "Give the support team answers for the five most likely launch questions.", "todo", "medium", -3, 4),
    ("Q4 launch", "Record product walkthrough", "A tight three-minute tour for the launch page and sales follow-ups.", "todo", "urgent", 6, 2),
    ("Q4 launch", "Confirm rollout checklist", "Final check of feature flags, monitoring and the rollback plan.", "done", "high", -1, 6),
    ("Website refresh", "Refresh customer testimonials", "Replace dated quotes and make sure each quote has permission on file.", "todo", "low", None, 5),
    ("Mobile app v2", "Reduce dashboard payload", "Remove redundant fields from the dashboard response and verify query counts.", "done", "medium", -5, 1),
    ("Q4 launch", "Schedule launch retrospective", "Book the room and prepare a short agenda focused on what to keep.", "todo", "low", 10, 4),
    ("Legacy migration", "Retire old import worker", "The worker has been replaced; keep the record here for the audit trail.", "done", "low", -20, 30),
]


class Command(BaseCommand):
    help = "Create idempotent demonstration projects and tasks for an existing user."

    def add_arguments(self, parser):
        parser.add_argument(
            "--user",
            required=True,
            help="Username of the account that should receive the demo data.",
        )

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username=options["user"])
        except User.DoesNotExist as exc:
            raise CommandError(
                f"User '{options['user']}' does not exist. "
                "Create it with 'createsuperuser' or register first."
            ) from exc

        now = timezone.now()
        today = timezone.localdate()
        project_map = {}
        projects_created = 0
        for data in PROJECTS:
            project, created = Project.objects.get_or_create(
                owner=user,
                name=data["name"],
                defaults={
                    "description": data["description"],
                    "color": data["color"],
                    "is_archived": data["is_archived"],
                },
            )
            project_map[project.name] = project
            projects_created += int(created)

        tasks_created = 0
        for index, (
            project_name,
            title,
            description,
            status,
            priority,
            due_offset,
            created_days_ago,
        ) in enumerate(TASKS):
            project = project_map.get(project_name)
            if project is None:
                continue
            task, created = Task.objects.get_or_create(
                owner=user,
                project=project,
                title=title,
                defaults={
                    "description": description,
                    "status": status,
                    "priority": priority,
                    "due_date": (
                        today + timedelta(days=due_offset)
                        if due_offset is not None
                        else None
                    ),
                },
            )
            if not created:
                continue

            created_at = now - timedelta(
                days=created_days_ago,
                hours=index % 5,
            )
            updated_at = created_at + timedelta(hours=2 + (index % 8))
            completed_at = None
            if status == Task.Status.DONE:
                completed_at = now - timedelta(days=index % 5, hours=index % 4)
                updated_at = max(updated_at, completed_at)
            Task.objects.filter(pk=task.pk).update(
                created_at=created_at,
                updated_at=updated_at,
                completed_at=completed_at,
            )
            tasks_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo data ready for {user.username}: "
                f"{projects_created} new projects, {tasks_created} new tasks."
            )
        )
