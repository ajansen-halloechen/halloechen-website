from planner.v1 import types_pb2 as _types_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class PlanShiftsRequest(_message.Message):
    __slots__ = ("month", "planned_shifts", "availabilities", "user_preferences")
    MONTH_FIELD_NUMBER: _ClassVar[int]
    PLANNED_SHIFTS_FIELD_NUMBER: _ClassVar[int]
    AVAILABILITIES_FIELD_NUMBER: _ClassVar[int]
    USER_PREFERENCES_FIELD_NUMBER: _ClassVar[int]
    month: str
    planned_shifts: _containers.RepeatedCompositeFieldContainer[_types_pb2.PlannedShift]
    availabilities: _containers.RepeatedCompositeFieldContainer[_types_pb2.Availability]
    user_preferences: _containers.RepeatedCompositeFieldContainer[_types_pb2.UserPreference]
    def __init__(self, month: _Optional[str] = ..., planned_shifts: _Optional[_Iterable[_Union[_types_pb2.PlannedShift, _Mapping]]] = ..., availabilities: _Optional[_Iterable[_Union[_types_pb2.Availability, _Mapping]]] = ..., user_preferences: _Optional[_Iterable[_Union[_types_pb2.UserPreference, _Mapping]]] = ...) -> None: ...

class PlanShiftsResponse(_message.Message):
    __slots__ = ("assignments",)
    ASSIGNMENTS_FIELD_NUMBER: _ClassVar[int]
    assignments: _containers.RepeatedCompositeFieldContainer[_types_pb2.Assignment]
    def __init__(self, assignments: _Optional[_Iterable[_Union[_types_pb2.Assignment, _Mapping]]] = ...) -> None: ...
