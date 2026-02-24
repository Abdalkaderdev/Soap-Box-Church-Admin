import { useParams } from "wouter";

export default function MemberDetails() {
  const params = useParams<{ id: string }>();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Member Details</h1>
      <p className="text-muted-foreground mt-2">
        Viewing member ID: {params.id}
      </p>
    </div>
  );
}
